var Query = require('../../models/query');
var Report = require('../../models/report');

var TrendQueryer = function(options) {
  this.trend = options.trend;
};

// Get query object associated with the current trend
TrendQueryer.prototype.getQuery = function(callback) {
  if (this.query) return callback(null, this.query);
  var self = this;
  Query.findById(this.trend._query, function(err, query) {
    if (err) return callback(err);
    self.query = query;
    callback(null, query);
  });
};

// Query database and calculate trends
TrendQueryer.prototype.runQuery = function(callback) {
  var self = this;
  this.getQuery(function(err, query) {
    if (err) return callback(err);
    // Analyze trends from database
    Report.analyzeTrend(query, self.trend.timebox, callback);
  });
};

module.exports = TrendQueryer;
