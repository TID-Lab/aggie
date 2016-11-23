'use strict';
var Report = require('../models/report');
var each = require('async').eachSeries;

exports.up = function(next) {
  Report.find({}, function(err, reports) {
    if (err) return;
    each(reports, function(report, done) {
      var reportRaw = report.toObject();
      report._sources = [reportRaw._source];
      report._sourceNicknames = [reportRaw._sourceNickname];
      report.save(done);
    }, next);
  });
};

exports.down = function(next) {
  next();
};
