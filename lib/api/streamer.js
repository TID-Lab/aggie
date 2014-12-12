// Maintains a list of queries to be monitored. Runs the queries periodically and emits results.
// Stops running queries if no new reports arriving. Resumes when report flow resumes.
// Watches for changes to report status and incident. Streams them as they occur.

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
    case 'incident':
      this._addIncidentListeners(emitter);
      break;
    case 'report':
      this._addReportListeners(emitter);
      break;
    case 'reportUpdates':
      this._addReportUpdatesListeners(emitter);
      break;
  }
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
          setTimeout(self.query(), QUERY_INTERVAL);
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
  if (wasIdle) this.query();
};

Streamer.prototype._addIncidentListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('incident:save');

  // Listens to new incidents being written to the database
  emitter.on('incident:save', function(incident) {
    self.resumeQuery();
  });
};

Streamer.prototype._addReportListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('report:save');

  // Listens to new reports being written to the database
  emitter.on('report:save', function(report) {
    self.resumeQuery();
  });
};

Streamer.prototype._addReportUpdatesListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('report:status');
  emitter.removeAllListeners('report:incident');

  // Listens to report updates
  emitter.on('report:status', function(report) {
    Report.findById(report._id, function(err, report) {
      if (err) self.emit('error', err);
      else self.emit('reportStatusChanged', report);
    });
  });

  // Listens to changes in report incidents
  emitter.on('report:incident', function(report) {
    self.emit('reportIncidentChanged', report);
  });
};

module.exports = new Streamer();
