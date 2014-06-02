var express = require('express');
var Report = require('../../../models/report');
var ReportQuery = require('../../../models/query/report-query');
var _ = require('underscore');

module.exports = function(app, user) {
  app = app || express();
  user = user || require('../authorization')(app);

  // Get a list of all Reports
  app.get('/api/v1/report', user.can('view data'), function(req, res) {
    var page = req.query.page;
    // Parse query string
    var queryData = parseQueryData(req.query);
    if (queryData) {
      var query = new ReportQuery(queryData);
      // Query for reports using fti
      Report.queryReports(query, page, function(err, reports) {
        if (err) res.send(err.status, err.message);
        else res.send(200, reports);
      });
    } else {
      // Return all reports using pagination
      Report.findPage({}, page, {sort: '-storedAt'}, function(err, reports) {
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

  // Update Report data
  app.put('/api/v1/report/:_id', user.can('edit reports'), function(req, res, next) {
    // Find report to update
    Report.findById(req.params._id, function(err, report) {
      if (err) return res.send(err.status, err.message);
      if (!report) return res.send(404);
      // Update the actual value
      _.each(_.pick(req.body, ['status', '_incident']), function(val, key) {
        report[key] = val;
      });
      // Save report
      report.save(function(err, numberAffected) {
        if (err) res.send(err.status, err.message);
        else if (!numberAffected) res.send(404);
        else res.send(200);
      });
    });
  });

  // Delete all reports
  app.delete('/api/v1/report/_all', user.can('delete data'), function(req, res) {
    Report.remove(function(err) {
      if (err) res.send(err.status, err.message);
      else res.send(200);
    });
  });

  return app;
};

// Determine the search keywords
function parseQueryData(queryString) {
  if (!queryString) return;

  // Data passed through URL parameters
  return _.pick(queryString, ['keywords', 'status', 'after', 'before', 'sourceType', 'sourceId', 'incidentId']);
}
