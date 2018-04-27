'use strict';

var Source = require('../models/source');
var each = require('async').eachSeries;

exports.up = function(next) {
  Source.find({}, function(err, sources) {
    if (err || !sources) return;
    each(sources, function(source, done) {
      if (source.media === 'twitter') {
        source.acceptedLanguages = [];
        source.save(function(err) {
          done();
        });
      }
    }, next);
  });
};

exports.down = function(next) {
  next();
};
