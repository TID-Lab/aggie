var database = require('../lib/database');
var mongoose = database.mongoose;
var textSearch = require('mongoose-text-search');
var Source = require('./source');
var Query = require('./query');
var _ = require('underscore');

var schema = new mongoose.Schema({
  authoredAt: Date,
  fetchedAt: Date,
  storedAt: Date,
  content: String,
  author: String,
  status: String,
  url: String,
  _source: {type: String, ref: 'Source'}
});

// Give the report schema text search capabilities
schema.plugin(textSearch);
// Add a text index to the `content` field
schema.index({content: 'text'});

schema.pre('save', function(next) {
  if (this.isNew) this._wasNew = true;
  this.storedAt = new Date();
  next();
});

schema.post('save', function() {
  if (this._wasNew) schema.emit('report', {_id: this._id.toString()});
  else if (this.isModified('status')) schema.emit('report:status', {_id: this._id.toString(), status: this.status});
});

var Report = mongoose.model('Report', schema);

// Query reports based on passed query data
var QUERY_LIMIT = 20;
Report.queryReports = function(query, callback) {
  if (typeof query === 'function') return Report.find(query);
  if (query instanceof Query) query = query.normalize();

  query.limit = query.limit || QUERY_LIMIT;
  query.filter = {};

  // Determine status filter
  if (query.status) {
    query.filter.status = {};
    if (query.status === 'assigned') query.filter.status.$exists = true;
    else if (query.status === 'unassigned') query.filter.status.$exists = false;
    else query.filter.status = query.status;
  }

  // Determine inclusive date filters
  if (query.after || query.before) {
    query.filter.storedAt = {};
    if (query.after) query.filter.storedAt.$gte = query.after;
    if (query.before) query.filter.storedAt.$lte = query.before;
  }

  // Convert sourceId to _source ID for Report compatibility
  if (query.sourceId) query.filter._source = query.sourceId;

  // Return only newer results
  if (query.since) {
    query.filter.storedAt = query.filter.storedAt || {};
    query.filter.storedAt.$gte = query.since;
  }

  // Re-set search timestamp
  query.since = new Date();

  if (!query.keywords) {
    // Just use filters when no keywords are provided
    Report.find(query.filter, function(err, reports) {
      if (err) return callback(err);
      callback(null, reports);
    });
  } else {
    Report.textSearch(query.keywords, _.pick(query, ['filter', 'limit']), function(err, reports) {
      if (err) return callback(err);
      callback(null, _.pluck(reports.results, 'obj'));
    });
  }
};

Report.getTimebox = function(report, box) {
  var date = report.storedAt.getTime();
  box *= 1000; // Convert to ms
  var timebox = Math.floor(date / box) * box;
  report.timebox = new Date(timebox);
};

// Analyze trends for a given keyword
Report.analyzeTrend = function(query, timebox, callback) {
  if (!query.keywords) return callback(new Error('Query needs a keyword to analyze'));

  var options = {
    filter: {storedAt: {$gte: query.since || new Date(0)}},
    limit: 0,
    lean: true
  };

  // Re-set search timestamp
  query.since = new Date();

  Report.textSearch(query.keywords, options, function(err, reports) {
    if (err) return callback(err);
    var trends = _.chain(reports.results).pluck('obj').map(function(report) {
      // Calculate timebox
      Report.getTimebox(report, timebox);
      return report;
    }).countBy('timebox').map(function(counts, box) {
      // Count matching reports per timebox
      return {timebox: box, counts: counts};
    }).value();
    callback(null, trends);
  });
};

module.exports = Report;
