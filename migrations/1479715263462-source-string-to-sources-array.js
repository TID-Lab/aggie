/* eslint-disable no-invalid-this, no-console */
'use strict';

var Report = require('../models/report');
var THROTTLE = 20;

function streamingUpdate(Model, throttle, which, editFn, next) {
  var stream = Model.find(which).stream();
  var running = 0;

  stream.on('data', function(doc) {
    running++;
    if (running >= throttle) this.pause();
    doc = editFn(doc);

    var self = this;
    doc.save(function(err) {
      if (err) return console.err(err);
      running--;
      if (running < throttle) self.resume();
    });
  });

  stream.on('close', next);
}

exports.up = function(next) {
  streamingUpdate(Report, THROTTLE, {}, function(report) {
    var reportRaw = report.toObject();
    if (!report._sources || !report._sources.length) {
      report._sources = reportRaw._source ? [reportRaw._source] : [];
    }
    if (!report._sourceNicknames || !report._sourceNicknames.length) {
      report._sourceNicknames = reportRaw._sourceNickname ? [reportRaw._sourceNickname] : [];
    }
    return report;
  }, next);
};

exports.down = function(next) {
  next();
};
