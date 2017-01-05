/* eslint-disable no-console */
'use strict';

var Report = require('./models/report');

var incidents = {};

Report.find({ _incident: { $exists: true } }, function(err, reports) {
  if (err) {
    console.error(err.message);
    return process.exit(1);
  }
  console.log(reports);
  reports.forEach(function(report) {
    var i = report._incident;
    var m = report._media;
    if (!incidents[i]) incidents[i] = {};
    if (!incidents[i][m]) incidents[i][m] = 0;
    incidents[i][m] += 1;
  });

  console.log(incidents);
  process.exit(0);
});
