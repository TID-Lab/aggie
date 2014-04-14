var express = require('express');
var app = express();
var Report = require('../../models/report');
var Query = require('../../models/query');
var _ = require('underscore');

// Get a list of all Reports
app.get('/api/report', function(req, res) {
  // Parse query string
  var queryData = parseQueryData(req.query);
  if (queryData) {
    // Get query object
    Query.getQuery(queryData, function(err, query) {
      if (err) return res.send(500, err);
      // Query for reports using fti
      Report.queryReports(query, function(err, reports) {
        if (err) res.send(500, err);
        else res.send(200, reports);
      });
    });
  } else {
    // Return all reports
    Report.find(function(err, reports) {
      if (err) res.send(500, err);
      else res.send(200, reports);
    });
  }
});

// Delete all reports
app.delete('/api/report/_all', function(req, res) {
  Report.find(function(err, reports) {
    if (err) return res.send(500, err);
    if (reports.length === 0) return res.send(200);
    var remaining = reports.length;
    reports.forEach(function(report) {
      report.remove(function(err) {
        if (err) return res.send(500, err);
        if (--remaining === 0) return res.send(200);
      });
    });
  });
});

// Determine the search keywords
function parseQueryData(queryString) {
  if (!queryString) return;

  // Data passed through URL parameters
  if (_.has(queryString, 'keywords')) {
    return {type: 'Report', keywords: queryString.keywords};
  }
};

module.exports = app;
