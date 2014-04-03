var api = require('../api').app;
var Report = require('../../models/report');

// Get a list of all Reports
api.get('/api/report', function(req, res) {
  Report.find(function(err, reports) {
    if (err) res.send(500, err);
    else res.send(200, reports);
  });
});

api.delete('/api/report/_all', function(req, res) {
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

module.exports = api;
