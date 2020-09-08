#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright 2016 Zeta Co., Ltd. (www.zetamyanmar.com)
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

import re
import wa_zero_fixer

## a function to fix common typing errors in Myanmar
## it also fixes bugs from conversation from zawgyi to unicode

def normalize(input_string=None):
    if type(input_string) is not unicode:
        input_string = unicode(input_string, "utf8")

    ## reorder dependent vowel and dependent consonant signs
    input_string = re.sub(ur"([\u102B-\u1035]+)([\u103B-\u103E]+)", r"\2\1", input_string);

    # ## reordering myanmar storage order
    input_string = re.sub(ur"([\u102D\u102E\u1032]{0,})([\u103B-\u103E]{0,})([\u102F\u1030]{0,})([\u1036\u1037\u1038]{0,})([\u102D\u102E\u1032]{0,})", r"\2\1\5\3\4", input_string)
    input_string = re.sub(ur"(^|[^\u1000-\u1021\u103B-\u103E])(\u1031)([\u1000-\u1021])((?:\u1039[\u1000-\u1021])?)([\u103B-\u103E]{0,})", r"\1\3\4\5\2", input_string)

    ## for aukmyit and SIGN AA
    input_string = re.sub(ur"\u1037\u102C", u"\u102C\u1037", input_string)

	## For Latest Myanmar 3
    input_string = re.sub(ur"\u103A\u1037", u"\u1037\u103A", input_string)
    input_string = re.sub(ur"\u1036\u102F", u"\u102F\u1036", input_string)

    ## remove zero width space and zero width non-joiner
    input_string = re.sub(ur"[\u200B\u200C\u202C\u00A0]", "", input_string)

	## reorder Ya pint and Ha htoe
    input_string = re.sub(ur"\u103E\u103B", u"\u103B\u103E", input_string)

    ## remove duplicate dependent characters
    input_string = re.sub(ur"([\u102B-\u103E])\1+", r"\1", input_string)

    ## these duplicates based on document frequency errors
    ## remove double or more SIGN MEDIAL WA and HA
    input_string = re.sub(ur"(\u103D\u103E)+", u"\u103D\u103E", input_string)

    ## remove double or more VOWEL SIGN U and ANUSVARA
    input_string = re.sub(ur"(\u102F\u1036)+", u"\u102F\u1036", input_string)

    ## remove double or more SIGN 1 and SIGN U
    input_string = re.sub(ur"(\u102D\u102F)+", u"\u102D\u102F", input_string)

    ## fixed wrong spelling
    input_string = re.sub(ur"([\u102D\u102E])\u1030", ur"\1\u102F", input_string)

    ## For the case of ဖံွ့ဖြိုး
    input_string = re.sub(ur"([\u1000-\u1021])(\u1036)(\u103D)(\u1037)", r"\1\3\2\4", input_string)

    ## For the case of အိနိ္ဒယ
    input_string = re.sub(ur"([\u1000-\u1021])(\u102D)(\u1039)([\u1000-\u1021])", r"\1\3\4\2", input_string)
    input_string = re.sub(ur"([\u1000-\u1021])(\u1036)(\u103E)", r"\1\3\2", input_string)

    input_string = wa_zero_fixer.fix(input_string)

    ## seven and ra
    input_string = re.sub(ur"(\u1047)(?=[\u1000-\u101C\u101E-\u102A\u102C\u102E-\u103F\u104C-\u109F\u0020])", u"\u101B", input_string)
    input_string = re.sub(ur"\u1031\u1047", u"\u1031\u101B", input_string)

    ## reorder Sign U and auk myint
    input_string = re.sub(ur"\u1037\u102F", u"\u102F\u1037", input_string)

    ## reorder Sign Wa and  ANUSVARA
    input_string = re.sub(ur"\u1036\u103D", u"\u103D\u1036", input_string)

    ## reorder for သင်္ဘော
    input_string = re.sub(ur"(\u1004)(\u1031)(\u103A)(\u1039)([\u1000-\u1021])", r"\1\3\4\5\2", input_string)

    ## type error
    input_string = re.sub(ur"(\u102D)(\u103A)+", r"\1", input_string)

    ## fix nya lay that and Sign U
    input_string = re.sub(ur"\u1025\u103A", u"\u1009\u103A", input_string)

    ## Type Error (reorder)
    input_string = re.sub(ur"([\u1000-\u1021])(\u1031)(\u103D)", r"\1\3\2", input_string)

    ## Type Error (reorder)
    input_string = re.sub(ur"([\u1000-\u1021])(\u1031)(\u103E)(\u103B)", r"\1\3\4\2", input_string)

    return input_string


if __name__ == "__main__":
    input_string1 = "ကျေ့ာ"
    input_string2 = "တယ်််််််််််"
    input_string3 = "တိုို့"
    input_string4 = "ဆုုုိိိိင်"
    input_string5 = "ဂိုုုုး"
    input_string6 = "ရှိိိိိ"
    input_string7 = "လိိို့"
    input_string8 = "နှိှုက်"
    input_string9 = "လံု"
    input_string10 = "ကှျ"
    input_string11 = "လုုုုီ"
    input_string13 = "နူူူူိး"
    input_string12 = "လုုုုိ"
    input_string14 = "လုုုုိ့"

    input_string15 = """
၂၀၁၆ ခုနှစ် မေလအတွင်း မြင်းခြံနှင့် မော်လမြိုင် သဘာဝဓာတ်ငေွသုံး ဓာတ်အားပေးစက်ရုံများမှ ဓာတ်အား ၁၆၃ မဂ္ဂါ၀ပ် ထပ်မံထွက်ရှိမည်ဖြစ်ပြီး စုစုပေါင်း နိုင်ငံတော်ဓာတ်အားစနစ်တွင် ထုတ်လုပ်မှုပမာဏ မဂ္ဂါ၀ပ် ၂၇၀၀ ကျော်ရှိလာမည်ဖြစ်ကြောင်း လှျပ်စစ်နှင့် စွမ်းအင်ဝန်ကြီးဌာန၏ ရက် ၁၀၀ စီမံကိန်းများ (မေလ ၁ ရက်က စတင်) အရ သိရသည်။
""ဓာတ်အားထုတ်လုပ်ရေး အပိုင်းမှာ မေလ ၁၈ ရက်နေ့ကနေစပြီး မော်လမြိုင် သဘာဝဓာတ်ငေွ့သုံး ဓာတ်အားပေးစက်ရုံရဲ့ စွန့်ပစ်အပူသုံး ဓာတ်အားပေးစက်ကနေ ၃၀ မဂ္ဂါ၀ပ်နဲ့ မေလ ၃၁ ရက်နေ့မှာ မြင်းခြံဒေသ သဘာဝဓာတ်ငေွ့သုံး ဓာတ်အားပေး စက်ကနေ ၁၃၃ မဂ္ဂါ၀ပ်ကို စတင်ထုတ်လုပ်ပေးနိုင်မှာ ဖြစ်ပါတယ်"" ဟု လှျပ်စစ်နှင့် စွမ်းအင်ဝန်ကြီးဌာန ပြည်ထောင်စုဝန်ကြီး ဦးဖေဇင်ထွန်းက ပြောသည်။
လှျပ်စစ်ဓာတ်အား လိုအပ်ချက်ကြောင့် မြန်မာနိုင်ငံတွင် သဘာဝဓာတ်ငေွ့သုံး လှျပ်စစ်ဓာတ်အားပေး စက်ရုံများကို တိုးချဲ့အသုံးပြု နေခြင်းဖြစ်သည်။ သဘာဝဓာတ်ငေွ့သုံး လှျပ်စစ်ဓာတ်အား ထုတ်လုပ်မှုကို နှစ်စဉ်တိုးမြှင့်မှုကြောင့် ၂၀၁၆ ခုနှစ်တွင် နိုင်ငံပိုင်နှင့် ပုဂ္ဂလိကပိုင် နှစ်ရပ်ပေါင်း စက်ရုံ စုစုပေါင်း ၂၀ အထိ တိုးတက်လာပြီး တပ်ဆင်အင်အား ၂၄၀၃ မဂ္ဂါ၀ပ်နှင့် ထုတ်လုပ်မှုပမာဏ ၁၂၁၀ မဂ္ဂါ၀ပ်အထိ ရှိလာပြီဖြစ်ကြောင်း သိရသည်။
သဘာဝဓာတ်ငေွ့သုံး လှျပ်စစ်ဓာတ်အားပေးစက်ရုံများ ဖွင့်လှစ်နိုင်ခဲ့သော်လည်း လက်ရှိအချိန်အထိ မြန်မာနိုင်ငံတွင် လှျပ်စစ်ဓာတ်အား မဂ္ဂါ၀ပ် ၂၇၀၀ ၀န်းကျင်သာ သုံးစဲွနိုင်သေးခြင်းကြောင့် စီမံကိန်းသစ်များ မဆောင်ရွက်နိုင်ပါက ဖွံ့ဖြိုးတိုးတက်မှု နေှာင့်နေှးနိုင်ကြောင်းနှင့် ရေအား၊ သဘာဝဓာတ်ငေွ့၊    ကျောက်မီးသေွးသုံး ဓာတ်အားပေးစက်ရုံများ ထပ်မံတိုးချဲ့ တည်ဆောက်သွားမှသာ ၂၀၃၀ ပြည့်နှစ်တွင် တစ်နိုင်ငံလုံး လှျပ်စစ်မီး ရရှိနိုင်မည်ဖြစ်ကြောင်း ကျှမ်းကျင်သူများက သုံးသပ်ထားသည်။
မြန်မာနိုင်ငံ၏ လှျပ်စစ်ဓာတ်အား ထုတ်လုပ်မှုတွင် ရေအားလှျပ်စစ်မှ ၆၆ ရာခိုင်နှုန်းကျော်၊ သဘာဝဓာတ်ငေွ့မှ ၂၉ ရာခိုင်နှုန်းခန့်နှင့် ကျောက်မီးသေွးမှ သုံးရာခိုင်နှုန်းဝန်းကျင် ပါ၀င်နေခြင်းဖြစ်သည်။
မြန်မာနိုင်ငံတွင် လက်ရှိအချိန်အထိ တည်ဆောက်ပြီးခဲ့သည့် ရေအား၊ သဘာဝဓာတ်ငေွ့၊  ဒီဇယ်နှင့် ကျောက်မီးသေွးသုံး လှျပ်စစ်ဓာတ်အားပေး စက်ရုံများတွင် စုစုပေါင်း စက်တပ်ဆင်အား မဂ္ဂါ၀ပ် ၅၂၀၀ ကျော်ရှိပြီး နိုင်ငံတော် ဓာတ်အားစနစ်မှ ထုတ်လုပ်ဖြန့်ဖြူးမှုမှာ ၂၀၁၆ ခုနှစ် နေွကာလတွင် မဂ္ဂါ၀ပ် ၂၆၀၀ ၀န်းကျင်ရှိကြောင်း သိရသည်။
"""
    input_string16 = """ကဘေုိ"""
    input_string17 = "ခုနှစ် မေလ"
    input_string18 = "ဖေွ"
    input_string19 = "အေးေအး  အေးအေး"
    input_string20 = "ေလျှာက်"

    input_string21 = " ေက"
    input_string22 = "ဓာတ်ငေွသုံး ေကြ"
    input_string22 = "အိနိ္ဒယ"
    input_string = "အိနိ္ဒယ"

    print normalize(input_string=input_string)
    print normalize(input_string=input_string1)
    print normalize(input_string=input_string2)
    print normalize(input_string=input_string3)
    print normalize(input_string=input_string4)
    print normalize(input_string=input_string5)
    print normalize(input_string=input_string6)
    print normalize(input_string=input_string7)
    print normalize(input_string=input_string8)
    print normalize(input_string=input_string9)
    print normalize(input_string=input_string10)
    print normalize(input_string=input_string11)
    print normalize(input_string=input_string12)
    print normalize(input_string=input_string13)
    print normalize(input_string=input_string14)
    print normalize(input_string=input_string15)
    print normalize(input_string=input_string16)
    print normalize(input_string=input_string17)
    print normalize(input_string=input_string18)
    print normalize(input_string=input_string19)
    print normalize(input_string=input_string20)
