// A report is a single post/comment/article or other chunk of data from a source.
// This class is responsible for executing ReportQuerys.

var database = require('../lib/database');
var mongoose = database.mongoose;
var textSearch = require('mongoose-text-search');
var listenTo = require('mongoose-listento');
var Source = require('./source');
var Query = require('./query');
var _ = require('underscore');

var schema = new mongoose.Schema({
  authoredAt: Date,
  fetchedAt: Date,
  storedAt: Date,
  content: String,
  author: String,
  url: String,
  read: {type: Boolean, default: false, required: true},
  flagged: {type: Boolean, default: false, required: true},
  _source: {type: String, ref: 'Source'},
  _media: String,
  _sourceNickname: String,
  _incident: {type: String, ref: 'Incident'}
});

// Give the report schema text search capabilities
schema.plugin(textSearch);
schema.plugin(listenTo);
// Add a text index to the `content` field
schema.index({content: 'text'});

schema.path('_incident').set(function(_incident) {
  this._prevIncident = this._incident;
  return _incident;
});

schema.pre('save', function(next) {
  if (this.isNew) {
    this._wasNew = true;

    // Set default storedAt.
    if (!this.storedAt) this.storedAt = new Date();

  } else {
    // Capture updates before saving report
    if (this.isModified('_incident')) {
      this._incidentWasModified = true;
    }

  }
  next();
});

// Emit information about updates after saving report
schema.post('save', function() {
  if (this._wasNew) schema.emit('report:new', {_id: this._id.toString()});
  if (!this._wasNew) schema.emit('report:updated', {_id: this._id.toString()});

  if (this._incidentWasModified) {
    schema.emit('report:incident', {_id: this._id.toString(), _incident: this._incident ? this._incident.toString() : null});
    schema.emit('change:incident', this._prevIncident, this._incident);
  }
});

var Report = mongoose.model('Report', schema);

// Query reports based on passed query data
Report.queryReports = function(query, page, callback) {
  if (typeof query === 'function') return Report.findPage(query);
  if (typeof page === 'function') {
    callback = page;
    page = 0;
  }
  if (page < 0) page = 0;

  query.limit = 100;
  query.filter = {};

  // Determine inclusive date filters
  if (query.after || query.before) {
    query.filter.storedAt = {};
    if (query.after) query.filter.storedAt.$gte = query.after;
    if (query.before) query.filter.storedAt.$lte = query.before;
  }

  // Convert reference fields for Report compatibility
  if (query.sourceId) query.filter._source = query.sourceId;
  if (query.sourceType) query.filter._media = query.sourceType;
  if (query.incidentId) query.filter._incident = query.incidentId;

  // Determine author filter
  if (query.author) {
    query.filter.author = {};
  query.filter.author.$in = query.author.trim().split(/\s*,\s*/).sort().map(function(author){
      // Use case-insensitive matching with anchors so mongo index is still used.
      return new RegExp('^' + author + '$', 'i');
    });
  }

  // Return only newer results
  if (query.since) {
    query.filter.storedAt = query.filter.storedAt || {};
    query.filter.storedAt.$gte = query.since;
  }

  // Re-set search timestamp
  query.since = new Date();

  if (!query.keywords) {
    // Just use filters when no keywords are provided
    Report.findSortedPage(query.filter, page, callback);
  } else {
    Report.textSearch(query.keywords, _.pick(query, ['filter', 'limit']), function(err, reports) {
      if (err) return callback(err);
      var result = {
        total: reports.stats.n ? reports.stats.nscannedObjects : 0,
        results: _.chain(reports.results).pluck('obj').sortBy('storedAt').value().reverse()
      };
      callback(null, result);
    });
  }
};

Report.findSortedPage = function(filter, page, callback) {
  Report.findPage(filter, page, {sort: '-storedAt'}, function(err, reports) {
    if (err) return callback(err);
    callback(null, reports);
  });
};

module.exports = Report;
