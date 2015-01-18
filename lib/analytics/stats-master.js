// Watches for new reports and changes in sources.
// Executes throttled queries for various stats and triggers 'stats' event
// to expose stats data to other modules. 

var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var StatsQueryer = require('./stats-queryer');
var WAIT = 100; // ms

var StatsMaster = function() {
  this.statsQueryer = new StatsQueryer();

  // available listener bindings
  this.bindings = {
    report: this._addReportListeners,
    incident: this._addIncidentListeners,
    socket: this._addSocketListeners
  };

  this.countStats = _.throttle(this.countStats, WAIT);
};

util.inherits(StatsMaster, EventEmitter);

// Initialize event listeners
StatsMaster.prototype.addListeners = function(type, emitter) {
  console.log(type);
  this.bindings[type] && this.bindings[type].call(this, emitter);
};

// Load all stats stats
StatsMaster.prototype.countStats = function(type) {
  var self = this;
  process.nextTick(function() {
    console.log('count stats...');
    self.statsQueryer.count(type, function(err, stats) {
      console.log(err, stats);
      if (err) return;
      self.emit('stats', stats);
    });
  });
};

// Listen to new reports
StatsMaster.prototype._addReportListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('report:save');

  // Listens to new reports being written to the database
  emitter.on('report:save', function(report) {
    self.countStats('reports');
  });
};

// Listen to new incidents
StatsMaster.prototype._addIncidentListeners = function(emitter) {
  var self = this;

  // Listens to new incidents being written to the database
  emitter.on('incident:save', function(incident) {
    self.countStats('incidents');
  });
};

// Listen to socket
StatsMaster.prototype._addSocketListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('join:stats');

  // Listens to new reports being written to the database
  emitter.on('join:stats', function() {
    self.countStats();
  });
};

module.exports = new StatsMaster();
