// Maintains a list of queries to be monitored. Runs the queries periodically and emits results.
// Stops running queries if no new reports arriving. Resumes when report flow resumes.
// Watches for changes to report status and incident. Streams them as they occur.

var Query = require('../../models/query');
var Report = require('../../models/report');
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var QUERY_INTERVAL = 1000; // 1s

var Streamer = function() {
  this.queries = [];
  this.status = 'idle';
  this.throttledQuery = _.throttle(this.query, QUERY_INTERVAL);

  this.bindings = {
    report: this._addReportListeners,
    incident: this._addIncidentListeners
  };
};

util.inherits(Streamer, EventEmitter);

Streamer.prototype.addListeners = function(type, emitter) {
  this.bindings[type] && this.bindings[type].call(this, emitter);
};

// Track query, avoid duplicates
Streamer.prototype.addQuery = function(query) {
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
    query.run(function(err, results) {
      if (err) self.emit('error', err);
      if (results.total) {
        allEmpty = false;
        self.emit(query.event, query, results.results);
      }
      if (--remaining === 0) {
        // If no new reports were saved while querying, mark as idle
        if (allEmpty && self.status === 'querying') self.status = 'idle';
        // If not idle, queue next query batch
        if (self.status !== 'idle') {
          setTimeout(self.throttledQuery(), QUERY_INTERVAL);
        }
      }
    });
  });
};

// Resume query if receiving new data
Streamer.prototype.resumeQuery = function() {
  var wasIdle = this.status === 'idle';
  // Override current status to make sure queries get re-run
  this.status = 'pending';
  // Start querying if idle
  if (wasIdle) this.throttledQuery();
};

Streamer.prototype._addIncidentListeners = function(emitter) {
  var self = this;

  // Listens to new incidents being written to the database
  emitter.on('incident:save', function(incident) {
    self.resumeQuery();
  });
};

Streamer.prototype._addReportListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('report:new');

  // Listens to new reports being written to the database
  emitter.on('report:new', function(report) {
    self.resumeQuery();
  });
};

module.exports = new Streamer();
