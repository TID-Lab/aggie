var Trend = require('../../models/trend');
var ReportQuery = require('../../models/query/report-query');
var Report = require('../../models/report');
var _ = require('underscore');

var TrendQueryer = function(options) {
  this.trend = options.trend;
  try {
    // Parse serialized query object and instantiate it
    this.query = new ReportQuery(JSON.parse(this.trend._query));
  } catch (e) {}
};

// Query database and calculate trends
TrendQueryer.prototype.runQuery = function(callback) {
  var self = this;
  if (!this.trend.enabled) {
    process.nextTick(function() {
      callback(null, null, self.trend);
    });
    return;
  }
  // Analyze trends from database
  this.analyzeTrend(function(err, trends) {
    if (err) return callback(err);
    if (!trends.length) return callback(null, []);
    self.updateTrends(trends, function(err, trends) {
      if (err) callback(err);
      else callback(null, trends);
    });
  });
};

// Analyze trends for a given keyword
TrendQueryer.prototype.analyzeTrend = function(callback) {
  var self = this;

  var options = {
    filter: {storedAt: {$gte: this.query.since || this.trend.lastEnabledAt}},
    limit: 0,
    lean: true
  };

  // Convert reference fields for Report compatibility
  if (this.query.sourceId) options.filter._source = this.query.sourceId;
  if (this.query.sourceType) options.filter._sourceType = this.query.sourceType;
  if (this.query.incidentId) options.filter._incident = this.query.incidentId;

  // Re-set search timestamp
  this.query.since = new Date();

  Report.textSearch(this.query.keywords, options, function(err, reports) {
    if (err) return callback(err);
    var trends = _.chain(reports.results).pluck('obj').map(function(report) {
      // Get timebox for each report
      return self.getTimebox(report);
    }).countBy('timebox').map(function(counts, timebox) {
      // Count matching reports per timebox
      return {timebox: timebox, counts: counts};
    }).value();
    callback(null, trends);
  });
};

// Calculate timebox
TrendQueryer.prototype.getTimebox = function(report) {
  var date = report.storedAt.getTime();
  var timebox = this.trend.timebox * 1000; // Convert to ms
  report.timebox = Math.floor(date / timebox) * timebox;
  return report;
};

// Store trend counts back in trend object
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
