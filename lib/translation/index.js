'use strict';
var _ = require('underscore');
var am_en_dict = require('./am_en_trans_dict.json');


var Translation = function () {

};

// File format: English POS Tingirya Amharic (tab separated)

Translation.translate = function(sourceLang, targetLang, content) {
    var trans_dict = null;
    if(sourceLang === "am" && targetLang === "en") {
        trans_dict = am_en_dict;
    }
    if(typeof content === "string")
    {
        content = content.split(" ");
    } else if(typeof content !== "array") {
        return null;
    }
    var translated = [];
    for (const token of content) {
        if(token in trans_dict) {
            translated.push(trans_dict[token])
        }
    }
    if(translated.length > 0) {
        console.log("Translated: " + translated.join(" "));
    }
    return translated
};

module.exports = Translation;
