// A report is a single post/comment/article or other chunk of data from a source.
// This class is responsible for executing ReportQuerys.
'use strict';

var database = require('../lib/database');
var mongoose = database.mongoose;
var listenTo = require('mongoose-listento');
var Schema = mongoose.Schema;

var schema = new Schema({
  authoredAt: Date,
  fetchedAt: Date,
  storedAt: { type: Date, index: true },
  content: String,
  author: { type: String, index: true },
  url: String,
  metadata: Schema.Types.Mixed,
  tags: { type: [String], default: [] },
  read: { type: Boolean, default: false, required: true, index: true },
  flagged: { type: Boolean, default: false, required: true, index: true },
  _sources: [{ type: String, ref: 'Source', index: true }],
  _media: { type: String, index: true },
  _sourceNicknames: [String],
  _incident: { type: String, ref: 'Incident', index: true },
  checkedOutBy: { type: Schema.ObjectId, ref: 'User', index: true },
  checkedOutAt: { type: Date, index: true }
});

// Give the report schema text search capabilities
schema.plugin(listenTo);

// Add fulltext index to the `content` field.
schema.index({ content: 'text' });

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
  if (this._wasNew) schema.emit('report:new', { _id: this._id.toString() });
  if (!this._wasNew) schema.emit('report:updated', this);
  if (this._incidentWasModified) {
    schema.emit('change:incident', this._prevIncident, this._incident);
  }
});

schema.methods.toggleFlagged = function(flagged) {
  this.flagged = flagged;

  if (flagged) {
    this.read = true;
  }
};

schema.methods.toggleRead = function(read) {
  this.read = read;
};

var Report = mongoose.model('Report', schema);

// queryReports reports based on passed query data
Report.queryReports = function(query, page, callback) {
  if (typeof query === 'function') return Report.findPage(query);
  if (typeof page === 'function') {
    callback = page;
    page = 0;
  }
  if (page < 0) page = 0;

  var filter = query.toMongooseFilter();

  // Re-set search timestamp
  query.since = new Date();

  Report.findSortedPage(filter, page, callback);
};

Report.findSortedPage = function(filter, page, callback) {
  Report.findPage(filter, page, { sort: '-storedAt' }, function(err, reports) {
    if (err) return callback(err);
    callback(null, reports);
  });
};

module.exports = Report;
