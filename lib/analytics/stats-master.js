// Watches for new reports and changes in sources.
// Executes throttled queries for various stats and triggers 'stats' event
// to expose stats data to other modules. 

var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var QUERY_INTERVAL = 100; // ms

var StatsMaster = function() {
  // available listener bindings
  this.bindings = {
    report: this._addReportListeners,
    source: this._addSourceListeners,
    socket: this._addSocketListeners
  };

  this.loadStats = _.throttle(this.loadStats, QUERY_INTERVAL);
};

util.inherits(StatsMaster, EventEmitter);

// Initialize event listeners
StatsMaster.prototype.addListeners = function(type, emitter) {
  this.bindings[type] && this.bindings[type].call(this, emitter);
};

// Load all stats stats
StatsMaster.prototype.loadStats = function() {
  var self = this;

  process.nextTick(function() {
    self.emit('stats', { totals: 20 });
  });
};

// Listen to new reports
StatsMaster.prototype._addReportListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('report:save');

  // Listens to new reports being written to the database
  emitter.on('report:save', function(report) {
    self.loadStats();
  });
};

// Listen to new sources
StatsMaster.prototype._addSourceListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('source:save');

  // Listens to new reports being written to the database
  emitter.on('source:save', function(source) {
    self.loadStats();
  });
};

// Listen to socket
StatsMaster.prototype._addSocketListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('join:stats');

  // Listens to new reports being written to the database
  emitter.on('join:stats', function() {
    self.loadStats();
  });
};


module.exports = new StatsMaster();
