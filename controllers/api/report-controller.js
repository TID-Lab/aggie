var api = require('../api').app;
var Report = require('../../models/report');

// Get a list of all Reports
api.get('/api/report', function(req, res) {
  Report.find(function(err, reports) {
    if (err) res.send(500, err);
    else res.send(200, reports);
  });
});

module.exports = api;
