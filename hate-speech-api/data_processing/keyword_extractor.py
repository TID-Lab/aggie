#!/usr/bin/env python
# -*- coding: utf-8 -*-

## Copyright Zeta Co., Ltd.
## written by @moeseth based on research by @aye_hnin_khine

from mm_segmenter import Segmenter
from tfidf import TFIDF
import operator
import codecs
import json
import time
import zsql
import sys
import re
import os

class KeywordExtractor():
    def __init__(self, sql_manager=None, stopwords_path=None, burmese_df_path=None):
        if sql_manager:
            self.sql_manager = sql_manager
        else:
            self.sql_manager = None

        if stopwords_path:
            self.stopwords_path = stopwords_path
        else:
            curr_path = os.path.dirname(os.path.abspath(__file__))
            STOP_WORD_FILE = os.path.join(curr_path, "stopword.txt")
            self.stopwords_path = STOP_WORD_FILE

        self.segmenter = Segmenter(sql_manager=sql_manager, burmese_df_path=burmese_df_path)
        self.stopwords_dict = self.__load_stopwords()


    def __load_stopwords(self):
        if self.sql_manager is None:
            stopwords_dict = {}
            with codecs.open(self.stopwords_path, "rb", "utf-8") as f:
                lines = f.readlines()

                for line in lines:
                    line = line.strip()
                    if len(line) > 0 and not line.startswith("##"):
                        stopwords_dict[line] = True

            return stopwords_dict
        else:
            query = "select word from ke_stopword where is_deleted = false"
            results = self.sql_manager.execute(query, [])
            stopwords_dict = {}

            for r in results:
                word = r["word"]
                word = word.strip()
                stopwords_dict[word] = True

            return stopwords_dict


    def __clean_up_keywords(self, segmented_words):
        cleaned_words = []
        for word in segmented_words:
            ## remove non-myanmar words and remove myanmar digits words
            if re.search(ur"[\u1000-\u104F]", word) and re.search(ur"[^\u1040-\u1049]", word):
                if not word in self.stopwords_dict:
                    cleaned_words.append(word)

        return cleaned_words


    ## we assume the input_string is in unicode and has been normalized
    def get_keywords(self, input_string):
        segmented_words = self.segmenter.segment(input_string=input_string)

        ## remove english and myanmar digits
        segmented_words = self.__clean_up_keywords(segmented_words)

        ## only need to look for unique keywords
        unique_segmented_words = list(set(segmented_words))

        ## check 15% of unique words
        temp_keyword_limit = int(len(unique_segmented_words) * 0.15)

        ## make sure minimum is 10 keywords
        keyword_limit = max(temp_keyword_limit, 10)

        ## make sure maximum is 30 keywords
        keyword_limit = min(keyword_limit, 30)

        score_dict = {}

        self.tfidf = TFIDF(self.segmenter.total_counted_documents, segmented_words, self.segmenter.words_dict, sql_manager=self.sql_manager)

        for word in unique_segmented_words:
            tf_score = self.tfidf.getTF(word, segmented_words)
            idf_score = self.tfidf.getIDF(word)

            tfidf_score = tf_score * idf_score
            score_dict[word] = tfidf_score

        ## sort the dictionary by tfidf_score
        sorted_keywords = sorted(score_dict.items(), key=operator.itemgetter(1), reverse=True)

        return sorted_keywords[:keyword_limit]
