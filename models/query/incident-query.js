// Subclass of Query. Represents a query of the incident collection.

var Incident = require('../incident');
var Query = require('../query');
var util = require('util');
var _ = require('underscore');

var IncidentQuery = function(options) {
  this.title = options.title;
  this.locationName = options.locationName;
  this.assignedTo = options.assignedTo;
  this.status = options.status;
  this.veracity = options.veracity;
  this.event = 'incidents';
};

_.extend(IncidentQuery, Query);
util.inherits(IncidentQuery, Query);

IncidentQuery.prototype.run = function(callback) {
  Incident.queryIncidents(this, callback);
};

// Normalize query for comparison
IncidentQuery.prototype.normalize = function() {
  var query = _.pick(this, _.without(Incident.filterAttributes, 'updatedAt'));
  if (query.title) query.title = query.title.toLowerCase();
  return query;
};

module.exports = IncidentQuery;
