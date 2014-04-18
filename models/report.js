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

  // Determine status filter
  if (query.status === 'assigned') query.status = {'$exists': true};
  else if (query.status === 'unassigned') query.status = {'$exists': false};

  // Determine inclusive date filters
  if (query.after || query.before) {
    query.storedAt = {};
    if (query.after) {
      query.storedAt['$gte'] = query.after;
      delete query.after;
    }
    if (query.before) {
      query.storedAt['$lte'] = query.before;
      delete query.before;
    }
  }

  Report.textSearch(query.keywords, _.pick(query, ['status', 'after', 'before', 'source_id']), function(err, reports) {
    if (err) return callback(err);
    callback(null, _.pluck(reports.results, 'obj'));
  });
};

module.exports = Report;
