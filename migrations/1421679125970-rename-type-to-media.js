var Report = require('../models/report');
var each = require('async').eachSeries;

exports.up = function(next) {
  Report.find({}, function(err, reports) {
    if (err || !reports) return;
    each(reports, function(report, done) {
      var reportRaw = report.toObject();
      report._media = reportRaw._sourceType;
      report.save(function(err) {
        done();
      });
    }, next);
  });
};

exports.down = function(next) {
  next();
};
