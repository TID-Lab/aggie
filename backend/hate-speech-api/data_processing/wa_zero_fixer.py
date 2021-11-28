#!/usr/bin/env python
# -*- coding: utf-8 -*-

## Copyright Zeta Co., Ltd.
## written by @moeseth

import re

def fix(input_string=None):
    if type(input_string) is not unicode:
        input_string = unicode(input_string, "utf8")

    ## convert everything into wa first
    input_string = re.sub(u"\u1040", u"\u101D", input_string)

    # 1. checking digit in front of wa, followed by either , or space
    # 2. checking if the dot or comma is in front of a zero
    # 3. checking if a zero is in front of dot or comma
    # 4. checking if a space followed by wa that is followed by a digit
    # 5. checking if the wa at the start of the sentence followed by a digit
    matches = re.finditer(ur"([\u1041-\u1049]+\.?[\u101D\u0020,]+|[\.,]\u101D+|\u101D+[\.,]\u101D?|\u0020\u101D+[\u1041-\u1049]+|^\u101D[\u1000-\u104F])", input_string)
    for match in matches:
        matched_string = match.group()
        matched_string = re.sub(u"\u101D", u"\u1040", matched_string);
        pos = match.start()

        ## convert string into list to do replacing
        s = list(input_string)
        s[pos: pos + len(matched_string)] = matched_string
        input_string = "".join(s)

    return input_string


if __name__ == "__main__":
    print fix(input_string="၁ဝဝဝဝ.ဝဝ၁ a ဝဝ a ဝ.ဝ၁ ၁,ဝဝဝ")
