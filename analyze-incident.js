/* eslint-disable no-console */
'use strict';

var Report = require('./models/report');
var _ = require('lodash');

var incidents = {};

Report.find({ _incident: { $exists: true } }, function(err, reports) {
  if (err) {
    console.error(err.message);
    return process.exit(1);
  }

  reports.forEach(function(report) {
    var i = report._incident;
    var m = report._media;
    if (!incidents[i]) incidents[i] = {};
    if (!incidents[i][m]) incidents[i][m] = 0;
    incidents[i][m] += 1;
  });

  var multiReportIncidents = _.filter(incidents, function(i) {
    return _.keys(i).length > 1 || i[_.keys(i)[0]] > 1;
  });

  console.log(multiReportIncidents);
  process.exit(0);
});
