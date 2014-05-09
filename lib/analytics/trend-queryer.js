var Trend = require('../../models/trend');
var Query = require('../../models/query');
var Report = require('../../models/report');

var TrendQueryer = function(options) {
  this.trend = options.trend;
  try {
    // Parse serialized query object and instantiate it
    this.query = new Query(JSON.parse(this.trend._query));
  } catch (e) {}
};

// Query database and calculate trends
TrendQueryer.prototype.runQuery = function(callback) {
  if (!this.trend.enabled) return callback(new Error('Trend is disabled'));
  var self = this;
  // Analyze trends from database
  Report.analyzeTrend(this.query, this.trend.timebox, function(err, trends) {
    if (err) return callback(err);
    if (!trends.length) return callback();
    self.updateTrends(trends, function(err, trends) {
      if (err) callback(err);
      else callback(null, trends);
    });
  });
};

TrendQueryer.prototype.updateTrends = function(trends, callback) {
  var self = this;
  var remaining = trends.length;
  trends.forEach(function(trend, i) {
    Trend.addTrend(self.trend._id, trend, function(err, counts) {
      if (err) return callback(err);
      trends[i] = counts;
      if (--remaining === 0) return callback(null, trends);
    });
  });
};

module.exports = TrendQueryer;
