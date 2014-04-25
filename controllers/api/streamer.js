var Query = require('../../models/query');
var Report = require('../../models/report');
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
  }
};

Streamer.prototype._addReportListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('report');

  // Listens to new reports being written to the database
  emitter.on('report', function(id) {
    var isIdle = self.status === 'idle';
    // Override current status to make sure queries get re-run
    self.status = 'pending';
    // Start querying if idle
    if (isIdle) self.query();
  });
};

// Track query, avoid duplicates
Streamer.prototype.addQuery = function(query) {
  var found = _.findWhere(this.queries, query.hash());
  if (!found) this.queries.push(query.hash());
};

// Remove query from list
Streamer.prototype.removeQuery = function(query) {
  this.queries = _.without(this.queries, query);
};

// Run all queries and emit the results
Streamer.prototype.query = function() {
  var self = this;
  var remaining = this.queries.length;
  var allEmpty = true;
  this.status = 'querying';
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
          setTimeout(function() {
            self.query();
          }, QUERY_INTERVAL);
        }
      }
    });
  });
};

module.exports = new Streamer();
