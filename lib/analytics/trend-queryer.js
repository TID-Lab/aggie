var Trend = require('../../models/trend');
var Query = require('../../models/query');
var Report = require('../../models/report');

var TrendQueryer = function(options) {
  var self = this;
  // TODO Pass actual Trend object in the first place
  Trend.findById(options.trend._id, function(err, trend) {
    self.trend = trend;
  });
};

// Get query object associated with the current trend
TrendQueryer.prototype.getQuery = function() {
  if (this.query) return this.query;
  this.query = new Query({type: 'Trend', keywords: this.trend.keywords});
  return this.query;
};

// Query database and calculate trends
TrendQueryer.prototype.runQuery = function(callback) {
  if (!this.trend.enabled) return callback(new Error('Trend is disabled'));
  var query = this.getQuery();
  var self = this;
  // Analyze trends from database
  Report.analyzeTrend(query, this.trend.timebox, function(err, trends) {
    if (err) return callback(err);
    if (trends.length) self.trend.addTrends(trends);
    callback(null, trends);
  });
};

module.exports = TrendQueryer;
