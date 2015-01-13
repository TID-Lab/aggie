var Source = require('../models/source');
var each = require('async').eachSeries;

exports.up = function(next) {
  Source.find({}, function(err, sources) {
    if (err || !sources) return;
    each(sources, function(source, done) {
      var sourceRaw = source.toObject();
      source.media = sourceRaw.type;
      source.save(function(err) {
        done();
      });
    }, next);
  });
};

exports.down = function(next) {
  next();
};
