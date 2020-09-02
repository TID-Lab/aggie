#!/usr/bin/env python
# -*- coding: utf-8 -*-

import znlp
import zsql

class ZNLPManager():
    def __init__(self, dbconfig=None):
        if dbconfig:
            self.sql_manager = zsql.SQLManager(dbconfig)
        else:
            self.sql_manager = None


    def extract_keywords(self, sentence):
        keyword_extractor = znlp.KeywordExtractor(sql_manager=self.sql_manager)
        keywords = keyword_extractor.get_keywords(sentence)

        return keywords


    def convert_to_unicode(self, sentence):
        unicode_string = znlp.mm_converter.zawgyi_to_unicode(sentence)
        return unicode_string


    def is_zawgyi(self, sentence):
        return znlp.mm_detector.is_zawgyi(sentence)


    def segment_sentence(self, sentence):
        segmenter = znlp.Segmenter(sql_manager=self.sql_manager)
        return segmenter.segment(sentence)


    def normalize_sentence(self, sentence):
        return znlp.mm_normalizer.normalize(sentence)
