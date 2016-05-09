// Determines user's preferred language from request headers
'use strict';
var locale = require('locale');
var fs = require('graceful-fs');
var _ = require('lodash');
var logger = require('../logger');

function supported() {
  var prefix = 'locale-';
  var suffix = '.json';
  var translations = fs.readdirSync('public/angular/translations');
  translations = _.filter(translations, function(filename) {
    return _.startsWith(filename, prefix) && _.endsWith(filename, suffix);
  });
  translations = _.map(translations, function(filename) {
    return filename.slice(prefix.length, -1 * suffix.length);
  });
  logger.debug('Supported languages: ' + translations);
  return translations;
}

module.exports = function(app) {
  app.use(locale(supported())); // Sets req.locale to the best available language

  app.use(function(req, res, next) {
    res.cookie('aggie-lang', req.locale);
    next();
  });
};
