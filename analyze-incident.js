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

  var sortedIncidents = _.sortBy(_.toPairs(incidents), [
    function(i) {
      i = i[1];
      return _.sum(_.values(i));
    },
    function(i) {
      i = i[1];
      return _.keys(i).length;
    },
    function(i) {
      i = i[1];
      return _.keys(i).sort().toString();
    }
  ]);
  console.log(sortedIncidents);

  process.exit(0);
});
