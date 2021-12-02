#!/usr/bin/env python
# -*- coding: utf-8 -*-

## Copyright Zeta Co., Ltd.
## written by @moeseth based on research by @aye_hnin_khine

import mm_tokenizer

def generate_mm_ngrams(input_string=None, n_size=1):
	tokens = mm_tokenizer.get_tokens(input_string=input_string)

	## http://locallyoptimal.com/blog/2013/01/20/elegant-n-gram-generation-in-python/
	return zip(*[tokens[i:] for i in xrange(n_size)])
