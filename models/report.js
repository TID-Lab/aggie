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
  _source: {type: String, ref: 'Source'},
  _sourceType: String,
  _sourceNickname: String
});

// Give the report schema text search capabilities
schema.plugin(textSearch);
// Add a text index to the `content` field
schema.index({content: 'text'});

schema.pre('save', function(next) {
  if (this.isNew) {
    this._wasNew = true;
    this.storedAt = new Date();
  }
  next();
});

schema.post('save', function() {
  if (this._wasNew) schema.emit('report:save', {_id: this._id.toString()});
  else if (this.isModified('status')) schema.emit('report:status', {_id: this._id.toString(), status: this.status});
});

var Report = mongoose.model('Report', schema);

// Find reports using pagination
Report.findPage = function(filters, page, callback) {
  if (typeof filters === 'function') {
    callback = filters;
    filters = {};
    page = 0;
  }
  if (typeof page === 'function') {
    callback = page;
    page = 0;
  }
  if (page < 0) page = 0;
  var limit = 25;
  Report.count(filters, function(err, count) {
    if (err) return callback(err);
    var result = {total: count};
    Report.find(filters, null, {limit: limit, skip: page * limit, sort: '-storedAt'}, function(err, reports) {
      if (err) return callback(err);
      result.results = reports;
      callback(null, result);
    });
  });
};

// Query reports based on passed query data
Report.queryReports = function(query, page, callback) {
  if (typeof query === 'function') return Report.findPage(query);
  if (query instanceof Query) query = query.normalize();
  if (typeof page === 'function') {
    callback = page;
    page = 0;
  }
  if (page < 0) page = 0;

  query.limit = 100;
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

  // Convert sourceId and sourceType for Report compatibility
  if (query.sourceId) query.filter._source = query.sourceId;
  if (query.sourceType) query.filter._sourceType = query.sourceType;

  // Return only newer results
  if (query.since) {
    query.filter.storedAt = query.filter.storedAt || {};
    query.filter.storedAt.$gte = query.since;
  }

  // Re-set search timestamp
  query.since = new Date();

  if (!query.keywords) {
    // Just use filters when no keywords are provided
    Report.findPage(query.filter, page, function(err, reports) {
      if (err) return callback(err);
      callback(null, reports);
    });
  } else {
    Report.textSearch(query.keywords, _.pick(query, ['filter', 'limit']), function(err, reports) {
      if (err) return callback(err);
      var result = {
        total: reports.stats.n ? reports.stats.nscannedObjects : 0,
        results: _.pluck(reports.results, 'obj')
      };
      callback(null, result);
    });
  }
};

module.exports = Report;
