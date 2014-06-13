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
  if (!this.trend.enabled) {
    process.nextTick(function() {
      callback(new Error('Trend is disabled'));
    });
    return;
  }
  var self = this;
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
  var options = this._parseQueryOptions(this.query);

  // Re-set search timestamp
  this.query.since = new Date();

  // Run report analysis
  this.runReportAnalysis(this.query.keywords, options, callback);
};

// Search for reports to run analysis
TrendQueryer.prototype.runReportAnalysis = function(keywords, options, callback) {
  var self = this;
  Report.textSearch(keywords, options, function(err, reports) {
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

// Backfill trend data
TrendQueryer.prototype.backFill = function(callback) {
  callback = callback || function() {};
  var self = this;

  // Find earliest report storedAt date
  Report.findEarliest(function(err, earliest) {
    // Determine correct query
    var query = _.clone(self.query);
    query.since = earliest;
    query.until = new Date();
    var options = self._parseQueryOptions(query);
    // Run trend analysis since the earliest time
    self.runReportAnalysis(query.keywords, options, function(err, trends) {
      if (err) return callback(err);
      if (!trends.length) return callback(null, []);
      // Sort by timebox
      trends = _.sortBy(trends, 'timebox');
      // Store trend counts in trend model
      self.updateTrends(trends, callback);
    });
  });
};

// Convert query into searchable options
TrendQueryer.prototype._parseQueryOptions = function(query) {
  var options = {
    filter: {storedAt: {$gte: query.since || this.trend.lastEnabledAt}},
    limit: 0,
    lean: true
  };

  if (query.until) options.filter.storedAt.$lt = query.until;

  // Convert reference fields for Report compatibility
  if (query.sourceId) options.filter._source = query.sourceId;
  if (query.sourceType) options.filter._sourceType = query.sourceType;
  if (query.incidentId) options.filter._incident = query.incidentId;

  return options;
};

module.exports = TrendQueryer;
