// Reads trends from the database and executes the queries they ask for.
// Watches for new trends created by the user.
// Watches for new reports and changes to fetching mode (on or off).
'use strict';

var Trend = require('../../models/trend');
var TrendQueryer = require('./trend-queryer');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var QUERY_INTERVAL = 10000; // 10s

function TrendMaster() {
  this.trends = [];
  this.status = 'idle';
  this.interval = QUERY_INTERVAL;
}

util.inherits(TrendMaster, EventEmitter);

// Initialize event listeners
TrendMaster.prototype.addListeners = function(type, emitter) {
  this.removeListeners(type, emitter);
  switch (type) {
  case 'trend':
    this._addTrendListeners(emitter);
    break;
  case 'report':
    this._addReportListeners(emitter);
    break;
  case 'fetching':
    this._addFetchingListeners(emitter);
    break;
  }
};

// Load all trends when initializing
TrendMaster.prototype.init = function() {
  var self = this;
  // Defer to next cycle to allow event listener binding
  process.nextTick(function() {
    self.loadAll();
  });
};

// Track new trend in master list
TrendMaster.prototype.add = function(trendId, callback) {
  callback = callback || _.noop;
  var self = this;
  Trend.findPageById(trendId, function(err, trend) {
    if (err) return callback(err);
    if (!trend) return callback(new Error.NotFound());
    // Set `lastEnabledAt` date to `now` to avoid analyzing prior data
    trend.lastEnabledAt = new Date();
    trend.save();
    // Add queryer to trend object
    trend = _.extend(trend.toJSON(), { queryer: new TrendQueryer({ trend: trend }) });
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
  callback = callback || _.noop;
  var self = this;
  Trend.find({}, '-counts', function(err, trends) {
    if (err) return callback(err);
    if (trends.length === 0) return callback(null, []);
    var remaining = trends.length;
    trends.forEach(function(trend) {
      process.nextTick(function() {
        self.load(trend._id, function() {
          if (--remaining === 0) callback(null, trends);
        });
      });
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

TrendMaster.prototype.enable = function() {
  this.status = 'idle';
};

TrendMaster.prototype.disable = function() {
  this.status = 'disabled';
};

// Query all trends and continue querying at a specific interval
TrendMaster.prototype.queryAll = function(interval) {
  if (this.status !== 'idle') return;
  this.interval = interval || this.interval;
  var remaining = this.trends.length;

  // If no trends to query, go back to idle mode.
  if (!remaining) {
    this.status = 'idle';
    return;
  }

  this.status = 'querying';
  var self = this;

  // Loop over all trends.
  this.trends.forEach(function(trend) {
    process.nextTick(function() {

      // Do the query and wait for callback.
      self.query(trend._id, function(err) {
        if (err) self.emit('error', err);

        // If we've queried all trends, schedule the next query batch.
        if (--remaining === 0) {
          self.emit('trend');

          // Make sure we haven't been disabled.
          if (self.status === 'querying') {
            // Queue next query batch
            setTimeout(function() {
              if (self.status === 'querying') self.status = 'idle';
              self.queryAll();
            }, self.interval);
          }
        }
      });
    });
  });
};

// Clean-up old listeners
TrendMaster.prototype.removeListeners = function(type, emitter) {
  if (type === 'all' || type === 'trend') {
    emitter.removeAllListeners('trend:save');
    emitter.removeAllListeners('trend:remove');
    emitter.removeAllListeners('trend:enable');
    emitter.removeAllListeners('trend:disable');
  }
  if (type === 'all' || type === 'report') {
    emitter.removeAllListeners('report:new');
  }
  if (type === 'all' || type === 'fetching') {
    emitter.removeAllListeners('fetching:start');
    emitter.removeAllListeners('fetching:stop');
  }
};

// Listen to changes in Trend models
TrendMaster.prototype._addTrendListeners = function(emitter) {
  var self = this;

  // Add trend when saving
  emitter.on('trend:save', function(trend) {
    self.add(trend._id, function(err, trend) {
      if (err) self.emit('error', err);
      // Backfill trend data
      if (!err && trend) {
        trend.queryer.backFill(function() {
          // reload
          self.load(trend._id, function(err, trend) {
            if (err) self.emit('error', err);
            self.emit('trend:backfill', trend);
          });
        });
      }
    });
  });

  // Remove trend when deleted
  emitter.on('trend:remove', function(trend) {
    self.remove(trend._id);
  });

  // Listen to `enable` event from the API process
  emitter.on('trend:enable', function(trend) {
    self.load(trend._id);
  });

  // Listen to `disable` event from the API process
  emitter.on('trend:disable', function(trend) {
    self.load(trend._id);
  });
};

// Listen to new reports
TrendMaster.prototype._addReportListeners = function(emitter) {
  var self = this;

  // Listens to new reports being written to the database
  emitter.on('report:new', function() {
    // Start querying if idle
    if (self.status === 'idle') self.queryAll();
  });
};

// Control trend master status remotely
TrendMaster.prototype._addFetchingListeners = function(emitter) {
  var self = this;

  emitter.on('fetching:start', function() {
    if (self.status === 'disabled') {
      self.enable();
      self.queryAll();
    }
  });
  emitter.on('fetching:stop', function() {
    self.disable();
  });
};

module.exports = new TrendMaster();
