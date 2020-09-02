#!/usr/bin/env python
# -*- coding: utf-8 -*-

## Copyright Zeta Co., Ltd.
## written by @moeseth based on research by @aye_hnin_khine

from matched_word import MatchedWord
import mm_syllablebreak
import mm_normalizer
import mm_tokenizer
import mm_converter
import mm_detector
import codecs
import json
import re
import os

class Segmenter():
    def __init__(self, sql_manager=None, burmese_df_path=None):
        if sql_manager:
            self.sql_manager = sql_manager
        else:
            self.sql_manager = None

        if burmese_df_path:
            self.burmese_df_path = burmese_df_path
        else:
            curr_path = os.path.dirname(os.path.abspath(__file__))
            WORDS_FILE = os.path.join(curr_path, "burmese_df.txt")
            self.burmese_df_path = WORDS_FILE

        self.total_counted_documents = 0
        self.words_array = []
        self.words_dict = {}
        self.segmented_matches = []
        self.__load_dictionary()


    def __load_dictionary(self):
        if self.sql_manager is None:
            with codecs.open(self.burmese_df_path, "rb", "utf-8") as f:
                lines = f.readlines()

                ## we will assume our total documents count is the biggest df in the words_df.txt file
                biggest_tdc = 0

                for line in lines:
                    line = line.strip()

                    if len(line) > 0 and not line.startswith("#"):
                        word, df = line.split(",")
                        df =  int(df)

                        self.words_dict[word] = df
                        self.words_array.append(word)

                        if int(df) > biggest_tdc:
                            biggest_tdc = int(df)

                self.total_counted_documents = biggest_tdc

        else:
            ## change query
            query = """ select word from burmese_dictionary
                        where is_deleted = 0 and syllable_count > 1
                        order by syllable_count DESC, length DESC
                    """
            results = self.sql_manager.execute(query, [])

            for r in results:
                word = r["word"]
                word = word.strip()

                self.words_array.append(word)


    def sanitize_string(self, input_string=None):
        if type(input_string) is not unicode:
            input_string = unicode(input_string, "utf8")

        if mm_detector.is_zawgyi(input_string=input_string):
            input_string = mm_converter.zawgyi_to_unicode(input_string=input_string)

        input_string = mm_normalizer.normalize(input_string=input_string)

        ## remove spaces between myanmar words
        ## use positive lookahead to matches \s that is followed by a [\u1000-\u104F], without making the [\u1000-\u104F] part of the match
        input_string = re.sub(ur"([\u1000-\u104F])\s+(?=[\u1000-\u104F])", r"\1", input_string)

        return input_string


    def put_back_segmented_matches(self, token):
        token_length = len(token)
        word_length = 0
        ordered_words = []

        ## since we replaced with same length,
        ## this function needs to be able to find back the same string with same length
        while word_length != token_length:
            try:
                word_obj = self.segmented_matches.pop(0)
            except IndexError as e:
                break

            word = word_obj.word
            word_length += len(word)

            ordered_words.append(word)

        return ordered_words


    def segment(self, input_string):
        input_string = self.sanitize_string(input_string=input_string)
        segmented_words = []
        self.segmented_matches = []

        if len(input_string) > 0:
            for key in self.words_array:
                if key in input_string:
                    matches = re.finditer(key, input_string)

                    for match in matches:
                        length = len(key)
                        ## if string behind is all good
                        match_start_position = match.start()

                        ## also need to check previous string for VIRAMA Killer
                        previous_string = input_string[match_start_position-1:]
                        if re.search(ur"^\u1039", previous_string):
                            continue

                        temp_string = input_string[match_start_position:]
                        is_valid_syllablebreak = mm_syllablebreak.is_valid_syllablebreak(temp_string, length)

                        if is_valid_syllablebreak:
                            to_replace = u"\uFFF0" * length
                            ## replacing string at index
                            input_string = input_string[:match_start_position] + to_replace + input_string[match_start_position + length:]

                            matched_word = MatchedWord(key, match.start())
                            self.segmented_matches.append(matched_word)

                            ## sort matches by start position
                            self.segmented_matches = sorted(self.segmented_matches, key=lambda x: x.start)


            tokens = mm_tokenizer.get_tokens(input_string=input_string)

            for token in tokens:
                if u"\uFFF0" in token:
                    ## if non \u00D2 in the string
                    ## split non \u00D2 and \u00D2
                    if re.search(ur"[^\uFFF0]", token):
                        ## add space between non \ufff0 and \ufff0
                        token = re.sub(ur"([^\uFFF0])(\uFFF0)", ur"\1 \2", token)
                        token = re.sub(ur"(\uFFF0)([^\uFFF0])", ur"\1 \2", token)

                        inside_tokens = mm_tokenizer.get_tokens(input_string=token)

                        for inside_token in inside_tokens:
                            if u"\uFFF0" in inside_token:
                                ordered_words = self.put_back_segmented_matches(inside_token)
                                segmented_words.extend(ordered_words)
                            else:
                                segmented_words.append(inside_token)
                    else:
                        ordered_words = self.put_back_segmented_matches(token)
                        segmented_words.extend(ordered_words)

                elif len(token) > 0:
                    segmented_words.append(token)


        return segmented_words
