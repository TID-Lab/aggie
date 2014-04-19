var database = require('../controllers/database');
var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');
var Source = require('./source');
var Query = require('./query');
var _ = require('underscore');

var schema = new mongoose.Schema({
  authoredAt: Date,
  fetchedAt: Date,
  storedAt: Date,
  timebox: Number,
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
  var report = this;
  report.storedAt = Date.now();
  if (!report._source) return next();
  // Find actual source object and store it as a sub-document
  Source.findOne(report._source, function(err, source) {
    report._source = undefined;
    if (err || !source) return next(err);
    report._source = source._id;
    next();
  });
});

var Report = mongoose.model('Report', schema);

// Query reports based on passed query data
Report.queryReports = function(query, callback) {
  if (typeof query === 'function') return Report.find(query);

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

  // Convert source_id to _source ID for Report compatibility
  if (query.source_id) query.filter._source = query.source_id;

  Report.textSearch(query.keywords, _.pick(query, 'filter'), function(err, reports) {
    if (err) return callback(err);
    callback(null, _.pluck(reports.results, 'obj'));
  });
};

module.exports = Report;
