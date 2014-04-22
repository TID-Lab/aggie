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
  Report.textSearch(query.keywords, function(err, reports) {
    if (err) return callback(err);
    callback(null, _.pluck(reports.results, 'obj'));
  });
};

module.exports = Report;
