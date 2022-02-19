// Maintains a list of queries to be monitored. Runs the queries periodically and emits results.
// Stops running queries if no new reports arriving. Resumes when report flow resumes.
// Watches for changes to report status and group. Streams them as they occur.
'use strict'
const Query = require('../models/query');
const Report = require('../models/report');
const _ = require('underscore');
const util = require('util');
const EventEmitter = require('events').EventEmitter;

const QUERY_INTERVAL = 1000; // 1s

let Streamer = function() {
  this.queries = [];
  this.status = 'idle';
  this.throttledQuery = _.throttle(this.query, QUERY_INTERVAL);

  this.bindings = {
    report: this._addReportListeners,
    group: this._addGroupListeners
  };
};

util.inherits(Streamer, EventEmitter);

Streamer.prototype.addListeners = function(type, emitter) {
  this.bindings[type] && this.bindings[type].call(this, emitter);
};

// Track query, avoid duplicates
Streamer.prototype.addQuery = function(query) {
  const found = _.findWhere(this.queries, query);
  if (!found) this.queries.push(query);
};

// Remove query from list
Streamer.prototype.removeQuery = function(query) {
  this.queries = _.without(this.queries, query);
};

// Run all queries and emit the results
Streamer.prototype.query = function() {
  let remaining = this.queries.length;
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
          var throttledQuery = self.throttledQuery()

          // FIXME the throttledQuery variable is sometimes undefined
          // this if statement is a temporary fix so Aggie can run
          if (typeof throttledQuery !== 'undefined') {
            setTimeout(throttledQuery, QUERY_INTERVAL);
          }
        }
      }
    });
  });
};

// Resume query if receiving new data
Streamer.prototype.resumeQuery = function() {
  const wasIdle = this.status === 'idle';
  // Override current status to make sure queries get re-run
  this.status = 'pending';
  // Start querying if idle
  if (wasIdle) this.throttledQuery();
};

Streamer.prototype._addGroupListeners = function(emitter) {
  let self = this;

  // Listens to new groups being written to the database
  emitter.on('group:save', function(group) {
    self.resumeQuery();
  });
};

Streamer.prototype._addReportListeners = function(emitter) {
  let self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('report:new');

  // Listens to new reports being written to the database
  emitter.on('report:new', function(report) {
    self.resumeQuery();
  });
};

module.exports = new Streamer();
