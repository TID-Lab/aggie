/*
 * This test suite is for static translation files in the
 * public/angular/translations/ directory. We test the files in this directory
 * directly, rather than their api endpoint /translations/, for a variety of
 * reasons.
 *   (1) These files are served statically, which is very simple
 *   (2) the code that serves these files is in lib/api.js which is monolithic
 *       and difficult to unit test
 *   (3) The filesystem is part of the internationalization feature which is
 *       externally exposed, in the sense that it is exposed to users who may
 *       want to add translations for a new language.
 */
'use strict';
var utils = require('./init');
var expect = require('chai').expect;
var fs = require('graceful-fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var deepKeys = require('deep-keys');
var clarinet = require('clarinet').parser();

var prefix = 'locale-';
var suffix = '.json';
var debugFile = prefix + 'debug' + suffix;
var englishFile = prefix + 'en' + suffix;

function getTranslations(dirname, callback) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) return callback(err);
    filenames = _.filter(filenames, function(filename) {
      return _.startsWith(filename, prefix) && _.endsWith(filename, suffix);
    });
    async.map(filenames, function(filename, mapCallback) {
      fs.readFile(path.join(dirname, filename), 'utf8', function(err, json) {
        if (err) return mapCallback(err);
        mapCallback(null, [filename, json]);
      });
    }, function(err, allLanguages) {
      if (err) return callback(err);
      callback(null, _.fromPairs(allLanguages));
    });
  });
}

function testTranslationDir(dirname) {
  describe('Translations files ' + dirname, function() {
    it('debug language should contain the union of the other languages',
       function(done) {
         getTranslations(dirname, function(err, allLanguages) {
           if (err) return done(err);
           var knownStrings = _.map(_.values(allLanguages), function(json) {
             return deepKeys(JSON.parse(json));
           });
           var allKnownStrings = _.union.apply({}, knownStrings);
           expect(allLanguages).to.have.property(debugFile);
           var debugTranslations = JSON.parse(allLanguages[debugFile]);
           expect(deepKeys(debugTranslations)).to.include.members(allKnownStrings);
           done();
         });
       });

    it('all languages should contain the keys included in the English locale',
       function(done) {
         this.timeout(4000);
         getTranslations(dirname, function(err, allLanguages) {
           if (err) return done(err);
           expect(allLanguages).to.have.property(englishFile);
           var englishKeys = deepKeys(JSON.parse(allLanguages[englishFile]));
           _.each(allLanguages, function(language) {
             var languageKeys = deepKeys(JSON.parse(language));
             var missingKeys = _.difference(englishKeys, languageKeys);
             expect(missingKeys).to.be.empty;
           });
           done();
         });
       });

    it("dictionaries shouldn't have duplicate keys", function(done) {
      function check(json, filename) {
        var keys = {};
        var lastKey;
        var path = [];

        var newKey = function(key) {
          key = key.replace(/(\.)/g, '\\.');
          var k = path.join('.') + (path.length ? '.' : '') + key;
          expect(keys, 'file [' + filename + ']').to.not.have.property(k);
          keys[k] = 'Yup';
          lastKey = key;
        };

        clarinet.onkey = newKey;
        clarinet.onopenobject = function(k) {
          if (lastKey) {
            path.push(lastKey);
          }
          newKey(k);
        };
        clarinet.oncloseobject = function() {
          path.pop();
        };
        clarinet.write(json).close();
      }

      getTranslations(dirname, function(err, allLanguages) {
        if (err) return done(err);
        _.each(allLanguages, check);
        done();
      });
    });

    after(utils.expectModelsEmpty);
  });
}

testTranslationDir('./public/angular/translations');
testTranslationDir('./lib/translations');
