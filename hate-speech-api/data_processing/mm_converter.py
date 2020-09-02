#!/usr/bin/env python
# -*- coding: utf-8 -*-

## based on rules by parabaik converter

import re
import mm_normalizer

def zawgyi_to_unicode(input_string=None):
    if type(input_string) is not unicode:
        input_string = unicode(input_string, "utf-8")

    input_string = re.sub(ur"\u106A", u"\u1009", input_string)
    input_string = re.sub(ur"\u1025\u1039", u"\u1009\u1039", input_string)
    input_string = re.sub(ur"\u1025\u102C", u"\u1009\u102C", input_string)
    input_string = re.sub(ur"\u1025\u102E", u"\u1026", input_string)

    input_string = re.sub(ur"\u106B", u"\u100A", input_string)
    input_string = re.sub(ur"\u1090", u"\u101B", input_string)
    input_string = re.sub(ur"\u108F", u"\u1014", input_string)

    ## ha
    input_string = re.sub(ur"[\u103D\u1087]", u"\u103E", input_string)

    ## wa
    input_string = re.sub(ur"\u103C", u"\u103D", input_string)

    ## ya yint
    input_string = re.sub(ur"[\u103B\u107E\u107F\u1080\u1081\u1082\u1083\u1084]", u"\u103C", input_string)

    ## ya
    input_string = re.sub(ur"[\u103A\u107D]", u"\u103B", input_string)

    ## reorder
    input_string = re.sub(ur"\u103E\u103B", u"\u103B\u103E", input_string)

    ## wa ha
    input_string = re.sub(ur"\u108A", u"\u103D\u103E", input_string)
    input_string = re.sub(ur"\u103E\u103D", u"\u103D\u103E", input_string)

    ## reordering
    ## reordering kinzi
    input_string = re.sub(ur"((?:\u1031)?)((?:\u103C)?)([\u1000-\u1021])\u1064", ur"\u1064\1\2\3", input_string)
    ## reordering kinzi lgt
    input_string = re.sub(ur"((?:\u1031)?)((?:\u103C)?)([\u1000-\u1021])\u108B", ur"\u1064\1\2\3\u102D", input_string)
    ## reordering kinzi lgtsk
    input_string = re.sub(ur"((?:\u1031)?)((?:\u103C)?)([\u1000-\u1021])\u108C", ur"\u1064\1\2\3\u102E", input_string)
    ## reordering kinzi ttt
    input_string = re.sub(ur"((?:\u1031)?)((?:\u103C)?)([\u1000-\u1021])\u108D", ur"\u1064\1\2\3\u1036", input_string)

    ## lgt ttt
    input_string = re.sub(ur"\u105A", u"\u102B\u103A", input_string)
    input_string = re.sub(ur"\u108E", u"\u102D\u1036", input_string)

    ## ha u
    input_string = re.sub(ur"\u1033", u"\u102F", input_string)
    input_string = re.sub(ur"\u1034", u"\u1030", input_string)
    input_string = re.sub(ur"\u1088", u"\u103E\u102F", input_string)

    ## ha uu
    input_string = re.sub(ur"\u1089", u"\u103E\u1030", input_string)

    ## auk myint
    input_string = re.sub(ur"\u1039", u"\u103A", input_string)
    input_string = re.sub(ur"[\u1094\u1095]", u"\u1037", input_string)

    ## Pasint order human error
    input_string = re.sub(ur"([\u1000-\u1021])([\u102C\u102D\u102E\u1032\u1036]){1,2}([\u1060\u1061\u1062\u1063\u1065\u1066\u1067\u1068\u1069\u1070\u1071\u1072\u1073\u1074\u1075\u1076\u1077\u1078\u1079\u107A\u107B\u107C\u1085])", ur"\1\3\2", input_string)

    ## converting virama signs
    input_string = re.sub(ur"\u1064", u"\u1004\u103A\u1039", input_string)
    input_string = re.sub(ur"\u104E", u"\u104E\u1004\u103A\u1038", input_string)
    input_string = re.sub(ur"\u1086", u"\u103F", input_string)

    input_string = re.sub(ur"\u1060", u"\u1039\u1000", input_string)
    input_string = re.sub(ur"\u1061", u"\u1039\u1001", input_string)
    input_string = re.sub(ur"\u1062", u"\u1039\u1002", input_string)
    input_string = re.sub(ur"\u1063", u"\u1039\u1003", input_string)
    input_string = re.sub(ur"\u1065", u"\u1039\u1005", input_string)
    input_string = re.sub(ur"[\u1066\u1067]", u"\u1039\u1006", input_string)
    input_string = re.sub(ur"\u1068", u"\u1039\u1007", input_string)
    input_string = re.sub(ur"\u1069", u"\u1039\u1008", input_string)

    input_string = re.sub(ur"\u106C", u"\u1039\u100B", input_string)
    input_string = re.sub(ur"\u1070", u"\u1039\u100F", input_string)

    input_string = re.sub(ur"[\u1071\u1072]", u"\u1039\u1010", input_string)
    input_string = re.sub(ur"[\u1073\u1074]", u"\u1039\u1011", input_string)

    input_string = re.sub(ur"\u1075", u"\u1039\u1012", input_string)
    input_string = re.sub(ur"\u1076", u"\u1039\u1013", input_string)
    input_string = re.sub(ur"\u1077", u"\u1039\u1014", input_string)
    input_string = re.sub(ur"\u1078", u"\u1039\u1015", input_string)
    input_string = re.sub(ur"\u1079", u"\u1039\u1016", input_string)

    input_string = re.sub(ur"\u107A", u"\u1039\u1017", input_string)
    input_string = re.sub(ur"\u107B", u"\u1039\u1018", input_string)
    input_string = re.sub(ur"\u107C", u"\u1039\u1019", input_string)

    input_string = re.sub(ur"\u1085", u"\u1039\u101C", input_string)
    input_string = re.sub(ur"\u106D", u"\u1039\u100C", input_string)

    input_string = re.sub(ur"\u1091", u"\u100F\u1039\u100D", input_string)
    input_string = re.sub(ur"\u1092", u"\u100B\u1039\u100C", input_string)
    input_string = re.sub(ur"\u1097", u"\u100B\u1039\u100B", input_string)
    input_string = re.sub(ur"\u106F", u"\u100E\u1039\u100D", input_string)
    input_string = re.sub(ur"\u106E", u"\u100D\u1039\u100D", input_string)

    ## reordering ra
    input_string = re.sub(ur"(\u103C)([\u1000-\u1021])((?:\u1039[\u1000-\u1021])?)", ur"\2\3\1", input_string)

    input_string = re.sub(ur"(\u103E)(\u103D)([\u103B\u103C])", ur"\3\2\1", input_string)

    input_string = re.sub(ur"(\u103E)([\u103B\u103C])", ur"\2\1", input_string)
    input_string = re.sub(ur"(\u103D)([\u103B\u103C])", ur"\2\1", input_string)

    ## wa and zero
    input_string = re.sub(ur"\u1040\u102D(?!\u0020?/)", u"\u101D\u102D", input_string)
    input_string = re.sub(ur"([^\u1040-\u1049])\u1040([^\u1040-\u1049\u0020]|[\u104a\u104b])", ur"\1\u101D\2", input_string)

    ## seven and ra
    input_string = re.sub(ur"(\u1047)(?=[\u1000-\u101C\u101E-\u102A\u102C\u102E-\u103F\u104C-\u109F\u0020])", u"\u101B", input_string)
    input_string = re.sub(ur"\u1031\u1047", u"\u1031\u101B", input_string)

    ## reordering storage order
    input_string = re.sub(ur"((?:\u1031)?)([\u1000-\u1021])((?:\u1039[\u1000-\u1021])?)((?:[\u102D\u102E\u1032])?)([\u1036\u1037\u1038]{0,2})([\u103B-\u103E]{0,3})([\u102F\u1030]{0,})([\u1036\u1037\u1038]{0,2})([\u102D\u102E\u1032]{0,})", r"\2\3\6\1\4\9\7\5\8", input_string)

    # normalization
    input_string = mm_normalizer.normalize(input_string=input_string)

    return input_string