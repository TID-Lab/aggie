var Trend = require('../../models/trend');
var TrendQueryer = require('./trend-queryer');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// TODO Set this back to 60000
var QUERY_INTERVAL = 5000; // 60s

var TrendMaster = function() {
  this.trends = [];
  this.status = 'idle';
};

util.inherits(TrendMaster, EventEmitter);

// Initialize event listeners
TrendMaster.prototype.addListeners = function(type, emitter) {
  switch (type) {
    case 'trend':
      this._addTrendListeners(emitter);
      break;
    case 'report':
      this._addReportListeners(emitter);
      break;
  }
};

// Track new trend in master list
TrendMaster.prototype.add = function(trendId, callback) {
  callback = callback || function() {};
  var self = this;
  Trend.findById(trendId, null, {lean:true}, function(err, trend) {
    if (err) return callback(err);
    if (!trend) return callback(new Error.NotFound());
    trend.queryer = new TrendQueryer({trend: trend});
    self.trends.push(trend);
    callback(null, trend);
  });
};

// Remove trend from master list
TrendMaster.prototype.remove = function(trendId) {
  this.trends = _.reject(this.trends, function(trend) {
    return trend._id.toString() === trendId.toString();
  });
};

// Load a trend by ID
TrendMaster.prototype.load = function(trendId, callback) {
  this.remove(trendId);
  this.add(trendId, callback);
};

// Load all trends from scratch
TrendMaster.prototype.loadAll = function(callback) {
  callback = callback || function() {};
  var self = this;
  Trend.find(function(err, trends) {
    if (err) return callback(err);
    if (trends.length === 0) return callback(null, []);
    var remaining = trends.length;
    trends.forEach(function(trend) {
      self.load(trend._id);
      if (--remaining === 0) callback(null, trends);
    });
  });
};

// Return trend based on ID
TrendMaster.prototype.getTrend = function(trendId) {
  return _.find(this.trends, function(trend) {
    return trend._id.toString() === trendId.toString();
  });
};

// Start querying for trend data
TrendMaster.prototype.query = function(trendId, callback) {
  var trend = this.getTrend(trendId);
  trend.queryer.runQuery(function(err, trends) {
    if (err) callback(err, null, trend);
    else callback(null, trends, trend);
  });
};

// Query all trends and continue querying at a specific interval
TrendMaster.prototype.queryAll = function(interval) {
  interval = interval || QUERY_INTERVAL;
  var remaining = this.trends.length;
  if (!remaining) {
    this.status = 'idle';
    return;
  }
  this.status = 'querying';
  var self = this;
  this.trends.forEach(function(trend) {
    self.query(trend._id, function(err, trends, trend) {
      if (err) self.emit('error', err);
      if (trends.length) self.emit('trends', {_id: trend._id});
      if (--remaining === 0) {
        if (self.status !== 'idle') {
          // Queue next query batch
          setTimeout(function() {
            self.status = 'idle';
            self.queryAll(interval);
          }, interval);
        }
      }
    });
  });
};

// Listen to changes in Trend models
TrendMaster.prototype._addTrendListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('save');
  emitter.removeAllListeners('remove');
  emitter.removeAllListeners('enable');
  emitter.removeAllListeners('disable');

  // Add trend when saving
  emitter.on('save', function(trend) {
    self.add(trend._id);
  });

  // Remove trend when deleted
  emitter.on('remove', function(trend) {
    self.remove(trend._id);
  });

  // Listen to `enable` event from the API process
  emitter.on('enable', function(trend) {
    self.load(trend._id);
  });

  // Listen to `disable` event from the API process
  emitter.on('disable', function(trend) {
    self.load(trend._id);
  });

  // Load all trends when initializing
  // Defer to next cycle to allow event listener binding
  process.nextTick(function() {
    self.loadAll();
  });
};

// Listen to new reports
TrendMaster.prototype._addReportListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('report');

  // Listens to new reports being written to the database
  emitter.on('report', function(id) {
    // Start querying if idle
    if (self.status === 'idle') self.queryAll();
  });
};

module.exports = new TrendMaster();
