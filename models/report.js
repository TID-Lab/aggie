// A report is a single post/comment/article or other chunk of data from a source.
// This class is responsible for executing ReportQuerys.

var database = require('../lib/database');
var mongoose = database.mongoose;
var textSearch = require('mongoose-text-search');
var listenTo = require('mongoose-listento');
var Source = require('./source');
var Query = require('./query');
var _ = require('underscore');
var async = require('async');

var Schema = mongoose.Schema;
var ITEMS_PER_BATCH = 10; // 10 items per batch
var BATCH_TIMEOUT = 5 * 60 * 1000 // 5 minutes

var schema = new Schema({
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
  _incident: {type: String, ref: 'Incident'},
  checkedOutBy : { type: Schema.ObjectId, ref: 'User' },
  checkedOutAt: Date
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

schema.methods.flag = function() {
  this.flagged = true;
  this.markAsRead();
};

schema.methods.markAsRead = function() {
  this.read = true;
  this.checkedOutBy = null;
  this.checkedOutAt = null;
};

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

Report.checkoutBatch = function(userId, callback) {
  async.series([ 
    this.releaseBatch, 
    this.lockBatch.bind(this, userId, ITEMS_PER_BATCH),
    this.loadBatch.bind(this, userId, ITEMS_PER_BATCH)
  ], function(err, results) {
    if (err) return callback(err);
    callback(null, results[2]);
  });
}

// release items in older batches
Report.releaseBatch = function(callback) {
  var conditions = { checkedOutAt: { $lt: timeAgo(BATCH_TIMEOUT) } };
  var update = { checkedOutBy: null, checkedOutAt: null };

  Report.update(conditions, update, { multi: true }, callback);
}

// cancel batch for given user
Report.cancelBatch = function(userId, callback) {
  var conditions = { checkedOutBy: userId };
  var update = { checkedOutBy: null, checkedOutAt: null };
  
  Report.update(conditions, update, { multi: true }, callback);
}

// lock a new batch for given user
Report.lockBatch = function(userId, limit, callback) {
  var conditions = {
    checkedOutAt: null, 
    checkedOutBy: null,
    read: false
  };

  Report.find(conditions).sort({storedAt: -1}).limit(limit).exec(function(err, reports) {
    if (err) return callback(err);
    var ids = reports.map(function(report) { return report._id; });
    var update = { checkedOutBy: userId, checkedOutAt: new Date() };
    Report.update({ _id: { $in: ids } }, update, { multi: true }, callback);
  });
}

// load a batch for user
Report.loadBatch = function(userId, limit, callback) {
  var conditions = {
    checkedOutAt: { $ne: null }, 
    checkedOutBy: userId
  };

  Report.find(conditions).limit(limit).exec(callback);
}


// helpers

function timeAgo(miliseconds) {
  var now = new Date();
  return new Date(now.getTime() - miliseconds);
}

module.exports = Report;
