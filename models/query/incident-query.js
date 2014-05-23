var Incident = require('../incident');
var Query = require('../query');
var util = require('util');
var _ = require('underscore');

var IncidentQuery = function(options) {
  this.title = options.title;
  this.locationName = options.locationName;
  this.assignedTo = options.assignedTo;
  this.status = options.status;
  this.verified = options.verified;
  this.event = 'incidents';
};

_.extend(IncidentQuery, Query);
util.inherits(IncidentQuery, Query);

IncidentQuery.prototype.run = function(callback) {
  Incident.queryIncidents(this, callback);
};

// Normalize query for comparison
IncidentQuery.prototype.normalize = function() {
  return _.pick(this, ['title', 'locationName', 'assignedTo', 'status', 'verified']);
};

module.exports = IncidentQuery;
