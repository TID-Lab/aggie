// Runs a query for a single trend.
// Stores results in the appropriate trend document in database.

var Trend = require('../../models/trend');
var ReportQuery = require('../../models/query/report-query');
var Report = require('../../models/report');
var _ = require('lodash');
var logger = require('../logger');

var TrendQueryer = function(options) {
  this.trend = options.trend;
  try {
    // Parse serialized query object and instantiate it
    this.query = new ReportQuery(JSON.parse(this.trend._query));
  } catch (err) {
    logger.log(err);
  }
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
  var filter = this._toMongooseFilter(this.query);

  // Re-set search timestamp
  this.query.since = new Date();

  Report.find(filter, function(err, reports) {
    if (err) return callback(err);
    var timeboxes = self.countTimeboxes(reports);
    callback(null, timeboxes);
  });
};

TrendQueryer.prototype.countTimeboxes = function(reports) {
  var self = this;
  return _.chain(reports).map(function(report) {
    // Get timebox for each report
    return self.getTimebox(report);
  }).countBy('timebox').map(function(counts, timebox) {
    // Count matching reports per timebox
    return { timebox: timebox, counts: counts };
  }).value();
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

  // Determine correct query
  var query = _.clone(this.query);
  query.since = new Date(Date.now - (60 * 60 * 4 * 1000)); // 4 hours ago
  query.until = new Date();
  var filter = this._toMongooseFilter(query);

  // Just use filters when no keywords are provided
  Report.find(filter, function(err, reports) {
    if (err) return callback(err);
    var trends = self.countTimeboxes(reports);
    if (!trends.length) return callback(null, []);
    // Sort by timebox
    trends = _.sortBy(trends, 'timebox');
    // Store trend counts in trend model
    self.updateTrends(trends, callback);
  });
};

// Convert query into searchable options
TrendQueryer.prototype._toMongooseFilter = function(query) {
  var filter = { storedAt: { $gte: query.since || this.trend.lastEnabledAt } };

  if (query.until) filter.storedAt.$lt = query.until;
  if (query.keywords) filter.$text = { $search: query.keywords };

  // Convert reference fields for Report compatibility
  if (query.sourceId) filter._source = query.sourceId;
  if (query.media) filter._media = query.media;
  if (query.incidentId) filter._incident = query.incidentId;

  return filter;
};

module.exports = TrendQueryer;
