var Query = require('../../models/query');
var Report = require('../../models/report');
var Trend = require('../../models/trend');
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var QUERY_INTERVAL = 100; // 100ms

var Streamer = function() {
  this.queries = [];
  this.status = 'idle';
};

util.inherits(Streamer, EventEmitter);

Streamer.prototype.addListeners = function(type, emitter) {
  switch (type) {
    case 'report':
      this._addReportListeners(emitter);
      break;
    case 'trends':
      this._addTrendsListeners(emitter);
      break;
  }
};

// Track query, avoid duplicates
Streamer.prototype.addQuery = function(query) {
  if (query instanceof Query) query = query.normalize();
  var found = _.findWhere(this.queries, query);
  if (!found) this.queries.push(query);
};

// Remove query from list
Streamer.prototype.removeQuery = function(query) {
  this.queries = _.without(this.queries, query);
};

// Run all queries and emit the results
Streamer.prototype.query = function() {
  var remaining = this.queries.length;
  if (!remaining) {
    this.status = 'idle';
    return;
  }
  var allEmpty = true;
  this.status = 'querying';
  var self = this;
  this.queries.forEach(function(query) {
    // Query database
    Report.queryReports(query, function(err, reports) {
      if (err) self.emit('error', err);
      if (reports.length) {
        allEmpty = false;
        self.emit('reports', query, reports);
      }
      if (--remaining === 0) {
        // If no new reports were saved while querying, mark as idle
        if (allEmpty && self.status === 'querying') self.status = 'idle';
        // If not idle, queue next query batch
        if (self.status !== 'idle') {
          setTimeout(self.query(), QUERY_INTERVAL);
        }
      }
    });
  });
};

Streamer.prototype._addReportListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('report');

  // Listens to new reports being written to the database
  emitter.on('report', function(id) {
    var wasIdle = self.status === 'idle';
    // Override current status to make sure queries get re-run
    self.status = 'pending';
    // Start querying if idle
    if (wasIdle) self.query();
  });
};

Streamer.prototype._addTrendsListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('trends');
  emitter.removeAllListeners('error');

  // Listens to new trends being analyzed
  emitter.on('trend', function(trend) {
    Trend.findPageById(trend._id, function(err, trend) {
      if (err) self.emit('error', err);
      else self.emit('trend', trend);
    });
  });
};

module.exports = new Streamer();
