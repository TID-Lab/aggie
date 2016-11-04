// Watches for new reports and changes in incidents.
// Executes throttled queries for various stats and triggers 'stats' event
// to expose stats data to other modules.

var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var StatsQueryer = require('./stats-queryer');
var WAIT = 500; // ms
var INTERVAL_WAIT = 1000 * 30; // 30 seconds

var StatsMaster = function() {
  this.statsQueryer = new StatsQueryer();

  this.stats = {
    totalReports: 0,
    totalReportsUnread: 0,
    totalReportsFlagged: 0,
    totalReportsPerMinute: 0,
    totalIncidents: 0,
    totalEscalatedIncidents: 0
  };

  // available listener bindings
  this.bindings = {
    report: this._addReportListeners,
    incident: this._addIncidentListeners,
    socket: this._addSocketListeners
  };

  this.throttledCountStats = _.throttle(this.countStats, WAIT);
  this._addInterval();
};

util.inherits(StatsMaster, EventEmitter);

// Initialize event listeners
StatsMaster.prototype.addListeners = function(type, emitter) {
  this.bindings[type] && this.bindings[type].call(this, emitter);
};

// Load all stats stats
StatsMaster.prototype.countStats = function(type, callback) {
  var self = this;
  callback = callback || function() {};
  process.nextTick(function() {
    self.statsQueryer.count(type, function(err, results) {
      if (err) return callback(err);

      _.extend(self.stats, results);
      self.emit('stats', self.stats);
      callback(null, results);
    });
  });
};

StatsMaster.prototype._addInterval = function() {
  setInterval(this.countStats.bind(this, 'interval'), INTERVAL_WAIT);
};

// Listen to new reports
StatsMaster.prototype._addReportListeners = function(emitter) {
  var self = this;

  // Listens to new reports being written to the database
  emitter.on('report:new', function(report) {
    self.throttledCountStats('reports');
  });

   // Listens to updated reports being written to the database
  emitter.on('report:updated', function(report) {
    self.throttledCountStats('reports');
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
