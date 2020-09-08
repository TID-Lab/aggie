#!/usr/bin/env python
# -*- coding: utf-8 -*-

## Copyright Zeta Co., Ltd.
## written by @moeseth based on research by @aye_hnin_khine

import re

def is_valid_syllablebreak(input_string=None, index=0):
    ## To check if the newest segmented part starts with a valid myanmar syllable
    ## do not need to check if the sentence starts with english or
    ## myanmar digits or independent vowels or punctuation or
    ## Consonant Great THA or various signs

    if type(input_string) is not unicode:
        input_string = unicode(input_string, "utf8")

    is_valid_syllablebreak = True

    ## only need to check the first two code point to see if it is a valid break
    segmented_string = input_string[index:index+2]
    segmented_string.strip()

    if len(segmented_string):
        ## disable matching incomplete myanmar words
        ## the regex is checking if the first word is part of the previous syllable
        ## it was part of previous syllable if a consonant is followed by various signs
        if re.match(ur"^[\u1000-\u1021][\u1037\u1039\u103A]+", segmented_string):
            is_valid_syllablebreak = False

        ## checking if the sentence starts with dependent vowels
        elif re.match(ur"^[\u102B-\u103E]", segmented_string):
            is_valid_syllablebreak = False

    return is_valid_syllablebreak
