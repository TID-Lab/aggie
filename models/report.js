// A report is a single post/comment/article or other chunk of data from a source.
// This class is responsible for executing ReportQuerys.
'use strict';

var database = require('../lib/database');
var mongoose = database.mongoose;
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.SchemaTypes;
var logger = require('../lib/logger');
var SMTCTag = require('../models/tag');

var schema = new Schema({
  authoredAt: Date,
  fetchedAt: Date,
  storedAt: { type: Date, index: true },
  content: { type: String, index: true },
  author: { type: String, index: true },
  url: String,
  metadata: Schema.Types.Mixed,
  tags: { type: [String], default: [] },
  smtcTags: {type: [{type: SchemaTypes.ObjectId, ref: 'SMTCTag'}], default: []},
  read: { type: Boolean, default: false, required: true, index: true },
  flagged: { type: Boolean, default: false, required: true, index: true },
  _sources: [{ type: String, ref: 'Source', index: true }],
  _media: { type: [String], index: true },
  _sourceNicknames: [String],
  _incident: { type: String, ref: 'Incident', index: true },
  checkedOutBy: { type: Schema.ObjectId, ref: 'User', index: true },
  checkedOutAt: { type: Date, index: true }
});

schema.index({'metadata.ct_tags': 1}, {background: true});
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

schema.methods.addSMTCTag = function(smtcTagId) {
  // TODO: Use Functional Programming
  // ML This finds the smtcTag to add (if it doesn't exists) then remove it.
  let isRepeat = false;
  this.smtcTags.forEach(function(tag) {
    if(smtcTagId === tag.toString()) {
      isRepeat = true;
    }
  });
  if (isRepeat === false) {
    this.smtcTags.push({_id: smtcTagId});
  }
  return smtcTagId;
}

schema.methods.removeSMTCTag = function(smtcTagId) {
  // TODO: Use Functional Programming
  // ML This finds the smtcTag to remove (if it exists) then remove it.
  if (this.smtcTags) {
    let fndIndex = -1;
    this.smtcTags.forEach(function(tag, index) {
      let string = tag.toString();
      if (smtcTagId === tag.toString()) {
        fndIndex = index;
      }
    })
    if (fndIndex !== -1) {
      this.smtcTags.splice(fndIndex, 1);
    }
  }
  return smtcTagId;
}

schema.methods.clearSMTCTags = function() {
  this.smtcTags = [];
}

var Report = mongoose.model('Report', schema);

SMTCTag.schema.on('tag:removed', function(id) {
  Report.find({smtcTags: id}, function(err, reports) {
    if (err) {
      logger.error(err);
    }
    reports.forEach(function(report) {
      var i = report.smtcTags.indexOf(id);
      if (i > -1) {
        report.smtcTags.splice(i, 1);
        report.save();
      }
    });
  });
})


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
