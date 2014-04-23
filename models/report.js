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
  if (this.isNew) this._wasNew = true;
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

schema.post('save', function() {
  if (this._wasNew) schema.emit('report', {_id: this._id.toString()});
  else if (this.isModified('status')) schema.emit('report:status', {_id: this._id.toString(), status: this.status});
});

var Report = mongoose.model('Report', schema);

// Query reports based on passed query data
Report.queryReports = function(query, callback) {
  if (typeof query === 'function') return Report.find(query);

  query.filter = {};

  // Return only newer results
  if (query.lastSearchedAt) {
    query.filter.storedAt = query.filter.storedAt || {};
    query.filter.storedAt.$gte = query.lastSearchedAt;
  }

  // Re-set search timestamp
  query.lastSearchedAt = new Date;

  Report.textSearch(query.keywords, _.pick(query, 'filter'), function(err, reports) {
    if (err) return callback(err);
    callback(null, _.pluck(reports.results, 'obj'));
  });
};

module.exports = Report;
