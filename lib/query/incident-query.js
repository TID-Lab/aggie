var Incident = require('../../models/incident');
var Query = require('./query');
var util = require('util');
var _ = require('underscore');

var IncidentQuery = function(options) {
  this.title = options.title;
  this.locationName = options.locationName;
  this.latitude = options.latitude;
  this.longitude = options.longitude;
  this.assignedTo = options.assignedTo;
  this.status = options.status;
  this.verified = options.verified;
  this.resultEvent = 'incident';
};

_.extend(IncidentQuery, Query);
util.inherits(IncidentQuery, Query);

IncidentQuery.prototype.runQuery = function(callback) {
  Incident.queryReports(this, callback);
};

// Normalize query for comparison
IncidentQuery.prototype.normalize = function() {
  return _.pick(this, ['title', 'locationName', 'latitude', 'longitude', 'assignedTo', 'status', 'verified']);
};

module.exports = IncidentQuery;
