var Incident = require('../models/incident');

exports.up = function(next) {
  Incident.find({}, function (err, incidents) {
    if (err || !incidents) return;

    next();
  });
};

exports.down = function(next) {
  next();
};
