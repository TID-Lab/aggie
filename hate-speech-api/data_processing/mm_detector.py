#!/usr/bin/env python
# -*- coding: utf-8 -*-

## Copyright Zeta Co., Ltd.
## written by @moeseth based on research by @aye_hnin_khine

import re

def is_zawgyi(input_string):
    is_zawgyi = False

    if type(input_string) is not unicode:
        input_string = unicode(input_string, "utf-8")

    results = re.search(ur'[\u1050-\u109f]|\u0020[\u103b\u107e-\u1084]|\u0020\u1031|^\u1031|^\u103b|\u1038\u103b|\u1038\u1031|\u1033|\u1034|[\u102d\u102e\u1032]\u103b|\u1039[^\u1000-\u1021]|\u1039$|\u108c', input_string)

    if results:
        is_zawgyi = True

    return is_zawgyi
