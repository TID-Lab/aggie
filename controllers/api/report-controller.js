var express = require('express');
var app = express();
var Report = require('../../models/report');

// Get a list of all Reports
app.get('/api/report', function(req, res) {
  Report.find(function(err, reports) {
    if (err) res.send(500, err);
    else res.send(200, reports);
  });
});

// Query for Reports
app.post('/api/report', function(req, res) {
  var queryData = '';
  req.on('data', function(chunk) {
    queryData += chunk;
  }).on('end', function() {
    queryData = JSON.parse(queryData);
    Report.queryReports(queryData, function(err, reports) {
      if (err) res.send(500, err);
      else res.send(200, reports);
    });
  });
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

module.exports = app;
