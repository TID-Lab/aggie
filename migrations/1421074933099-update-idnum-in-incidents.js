var Incident = require('../models/incident');
var each = require('async').eachSeries;

exports.up = function(next) {
  Incident.find({}, function(err, incidents) {
    if (err || !incidents) return;
    each(incidents, function(incident, done) {
      var incidentRaw = incident.toObject();
      incident.veracity = incidentRaw.verified;
      incident.save(function(err) {
        done();
      });
    }, next);
  });
};

exports.down = function(next) {
  next();
};
