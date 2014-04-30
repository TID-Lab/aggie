var express = require('express');
var Report = require('../../../models/report');
var Query = require('../../../models/query');
var _ = require('underscore');

module.exports = function(app) {
  app = app || express();

  // Get a list of all Reports
  app.get('/api/v1/report', function(req, res) {
    // Parse query string
    var queryData = parseQueryData(req.query);
    if (queryData) {
      var query = new Query(queryData);
      // Query for reports using fti
      Report.queryReports(query, function(err, reports) {
        if (err) res.send(err.status, err.message);
        else res.send(200, reports);
      });
    } else {
      // Return all reports
      Report.find(function(err, reports) {
        if (err) res.send(err.status, err.message);
        else res.send(200, reports);
      });
    }
  });

  // Get Report by id
  app.get('/api/v1/report/:_id', function(req, res) {
    Report.findById(req.params._id, function(err, report) {
      if (err) res.send(err.status, err.message);
      else if (!report) res.send(404);
      else res.send(200, report);
    });
  });

  // Delete all reports
  app.delete('/api/v1/report/_all', function(req, res) {
    Report.find(function(err, reports) {
      if (err) return res.send(err.status, err.message);
      if (reports.length === 0) return res.send(200);
      var remaining = reports.length;
      reports.forEach(function(report) {
        report.remove(function(err) {
          if (err) return res.send(err.status, err.message);
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  return app;
};

// Determine the search keywords
function parseQueryData(queryString) {
  if (!queryString) return;

  // Data passed through URL parameters
  if (_.has(queryString, 'keywords')) {
    return _.extend({type: 'Report'}, _.pick(queryString, ['keywords', 'status', 'after', 'before', 'sourceId']));
  }
}
