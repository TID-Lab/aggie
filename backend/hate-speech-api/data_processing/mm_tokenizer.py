#!/usr/bin/env python
# -*- coding: utf-8 -*-

## Copyright Zeta Co., Ltd.
## written by @moeseth based on research by @aye_hnin_khine

import re
import wa_zero_fixer

SAFE_DELIMITER  = u"\uFFFF"

def tokenize(input_string=None):
    if type(input_string) is not unicode:
        input_string = unicode(input_string, "utf8")

    input_string = wa_zero_fixer.fix(input_string=input_string)
    input_string = input_string.strip()

    input_string = re.sub(r"\n", u"\u0020", input_string)
    ## remove zero width space and zero width non-joiner
    input_string = re.sub(ur"[\u200B\u200C]", "", input_string)

    ## only remove all the *spaces* between myanmar words
    ## use positive lookahead to matches \s that is followed by a [\u1000-\u104F], without making the [\u1000-\u104F] part of the match
    input_string = re.sub(ur"([\u1000-\u104F])\s+(?=[\u1000-\u104F])", ur"\1", input_string)

    ## add a space between digits and non digits and non dot and non comma
    input_string = re.sub(ur"([^\u1040-\u1049\u002E\u002C])([\u1040-\u1049])", ur"\1`\2", input_string)
    input_string = re.sub(ur"([\u1040-\u1049])([^\u1040-\u1049\u002E\u002C])", ur"\1`\2", input_string)

    ## tokenize ။ and ၊
    input_string = re.sub(ur"(\u104A|\u104B)", ur"`\1`", input_string)

    ## auk ka mit and a tat reordering
    input_string = re.sub(ur"\u103A\u1037", ur"\u1037\u103A", input_string)

    input_string = re.sub(ur"([\u1000-\u102A\u103F\u104C-\u104F])", ur'`\1', input_string)
    input_string = re.sub(ur"`([\u1000-\u1021])([\u1039\u103A])", ur'\1\2', input_string)

    input_string = re.sub(ur"`([\u1000-\u1021])([\u1037\u103A])", ur'\1\2', input_string)
    input_string = re.sub(ur"([\u1039])`([\u1000-\u1021])", ur'\1\2', input_string)
    input_string = re.sub(ur"([\u1000-\u103F\u104C-\u104F])([!-\u00D7\u1040-\u104B\u2018-\u201D])", ur'\1`\2', input_string)

    input_string = re.sub(u"\u0020", "`", input_string)
    input_string = input_string.replace("``", "`")

    ## remove ` at the start of the input_string
    input_string = re.sub(ur"^`", "", input_string)
    input_string = input_string.replace("`", SAFE_DELIMITER)

    return input_string


def get_tokens(input_string=None):
    token_string = tokenize(input_string=input_string)
    tokens = token_string.split(SAFE_DELIMITER)
    return tokens


def get_tokens_count(input_string=None):
    tokens = get_tokens(input_string=input_string)
    return len(tokens)
