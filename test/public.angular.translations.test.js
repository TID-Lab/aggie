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
require('./init');
var expect = require('chai').expect;
var fs = require('graceful-fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var deepKeys = require('deep-keys');

function getTranslations(callback) {
   var dirname = 'public/angular/translations';
   fs.readdir(dirname, function(err, filenames) {
     if (err) return callback(err);
     async.map(filenames, function(filename, mapCallback) {
       fs.readFile(path.join(dirname, filename), function(err, json) {
         if (err) return mapCallback(err);
         mapCallback(null, [filename, JSON.parse(json)]);
      });
    }, function(err, allLanguages) {
      if (err) return callback(err);
      callback(null, _.object(allLanguages));
    });
  });
}

describe('Translations files', function() {
  it('debug language should contain the union of the other languages',
     function(done) {
    getTranslations(function(err, allLanguages) {
      if (err) return done(err);
      var knownStrings = _.map(_.values(allLanguages), function(translations) {
        return deepKeys(translations);
      });
      var allKnownStrings = _.union.apply({}, knownStrings);
      var debugFile = 'locale-debug.json';
      expect(allLanguages).to.have.property(debugFile);
      var debugTranslations = _.compact(allLanguages[debugFile]);
      expect(deepKeys(debugTranslations)).to.include.members(allKnownStrings);
      done();
    });
  });
});
