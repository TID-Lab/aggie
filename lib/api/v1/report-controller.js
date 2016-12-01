// Handles CRUD requests for reports.
'use strict';

var express = require('express');
var Report = require('../../../models/report');
var batch = require('../../../models/batch');
var ReportQuery = require('../../../models/query/report-query');
var _ = require('underscore');
var writelog = require('../../writeLog');
var tags = require('../../../shared/tags');

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
        else {
          writelog.writeReport(req, reports, 'filter', query);
          res.send(200, reports);
        }
      });
    } else {
      // Return all reports using pagination
      Report.findSortedPage({}, page, function(err, reports) {
        if (err) res.send(err.status, err.message);
        else res.send(200, reports);
      });
    }
  });

  // Load batch
  app.get('/api/v1/report/batch', user.can('view data'), function(req, res) {
    batch.load(req.session.user._id, function(err, reports) {
      if (err) res.send(err.status, err.message);
      else {
        writelog.writeBatch(req, 'loadBatch', reports);
        res.send(200, { results: reports, total: reports.length });
      }
    });
  });

  // Checkout new batch
  app.patch('/api/v1/report/batch', user.can('edit data'), function(req, res) {
    var query = new ReportQuery(req.body);
    batch.checkout(req.session.user._id, query, function(err, reports) {
      if (err) res.send(err.status, err.message);
      else {
        writelog.writeBatch(req, 'getNewBatch', reports);
        res.send(200, { results: reports, total: reports.length });
      }
    });
  });

  // Cancel batch
  app.put('/api/v1/report/batch', user.can('edit data'), function(req, res) {
    batch.cancel(req.session.user._id, function(err) {
      if (err) res.send(err.status, err.message);
      else {
        writelog.writeBatch(req, 'cancelBatch');
        res.send(200);
      }
    });
  });

  // Get Report by id
  app.get('/api/v1/report/:_id', function(req, res) {
    Report.findById(req.params._id, function(err, report) {
      if (err) res.send(err.status, err.message);
      else if (!report) res.send(404);
      else {
        writelog.writeReport(req, report, 'viewReport');
        res.send(200, report);
      }
    });
  });

  // Update Report data
  app.put('/api/v1/report/:_id', user.can('edit data'), function(req, res) {
    // Find report to update
    Report.findById(req.params._id, function(err, report) {
      if (err) return res.send(err.status, err.message);
      if (!report) return res.send(404);
      // Update the actual value
      _.each(_.pick(req.body, ['flagged', '_incident', 'read']), function(val, key) {
        report[key] = val;
      });
      // Save report
      report.save(function(err, numberAffected) {
        if (err) res.send(err.status, err.message);
        else if (!numberAffected) res.send(404);
        else {
          writelog.writeReport(req, report, 'flag/unflag/removeFromIncident');
          res.send(200);
        }
      });
    });
  });

  // Delete all reports
  app.delete('/api/v1/report/_all', user.can('edit data'), function(req, res) {
    Report.remove(function(err) {
      if (err) res.send(err.status, err.message);
      else {
        writelog.writeReport(req, {}, 'deleteAllReports');
        res.send(200);
      }
    });
  });

  // Mark selected reports as read
  app.patch('/api/v1/report/_read', user.can('edit data'), function(req, res) {
    if (!req.body.ids || !req.body.ids.length) return res.send(200);
    Report.find({ _id: { $in: req.body.ids } }, function(err, reports) {
      if (err) return res.send(err.status, err.message);
      if (reports.length === 0) return res.send(200);
      var remaining = reports.length;
      reports.forEach(function(report) {
        // Mark each report as read only to catch it in model
        report.toggleRead(req.body.read);
        report.save(function(err) {
          if (err) return res.send(err.status, err.message);
          writelog.writeReport(req, report, 'markAsRead');
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  // Flag selected reports
  app.patch('/api/v1/report/_flag', user.can('edit data'), function(req, res) {
    if (!req.body.ids || !req.body.ids.length) return res.send(200);
    Report.find({ _id: { $in: req.body.ids } }, function(err, reports) {
      if (err) return res.send(err.status, err.message);
      if (reports.length === 0) return res.send(200);
      var remaining = reports.length;
      reports.forEach(function(report) {
        // Mark each report as flagged to catch it in model
        report.toggleFlagged(req.body.flagged);
        report.save(function(err) {
          if (err) return res.send(err.status, err.message);
          writelog.writeReport(req, report, 'flagReport');
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  // Link selected reports to one incident
  app.patch('/api/v1/report/_link', user.can('edit data'), function(req, res) {
    if (!req.body.ids || !req.body.ids.length) return res.send(200);
    Report.find({ _id: { $in: req.body.ids } }, function(err, reports) {
      if (err) return res.send(err.status, err.message);
      if (reports.length === 0) return res.send(200);
      var remaining = reports.length;
      reports.forEach(function(report) {
        report.read = true;
        report._incident = req.body.incident;
        report.save(function(err) {
          if (err) return res.send(err.status, err.message);
          writelog.writeReport(req, report, 'addToIncident');
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  return app;
};

// Determine the search keywords
function parseQueryData(queryString) {
  if (!queryString) return {};
  // Data passed through URL parameters
  var query = _.pick(queryString, ['keywords', 'status', 'after', 'before', 'media',
                                   'sourceId', 'incidentId', 'author', 'tags']);
  if (query.tags) query.tags = tags.toArray(query.tags);
  return query;
}
