// Subclass of Query. Represents a stats query.

var Incident = require('../incident');
var Report = require('../report');
var Query = require('../query');
var util = require('util');
var _ = require('underscore');

var StatsQuery = function(options) {
  this.event = 'stats';
};

_.extend(StatsQuery, Query);
util.inherits(StatsQuery, Query);

StatsQuery.prototype.run = function(callback) {
  callback(null, { total: 100 });
};

// Normalize query for comparison
StatsQuery.prototype.normalize = function() {
  return { event: this.event };
};

module.exports = StatsQuery;
