// An group is an occurrence that is being monitored by the team.
// It is generally associated with one or more reports.
// Other metadata is stored with the group to assist tracking.
// This class is responsible for executing GroupQuerys.
/* eslint-disable no-invalid-this */
'use strict';

var database = require('../lib/database');
var mongoose = database.mongoose;
var SchemaTypes = mongoose.SchemaTypes;
var validator = require('validator');
var _ = require('underscore');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Report = require('./report');
var logger = require('../lib/logger');
var SMTCTag = require('../models/tag');

require('../lib/error');


var lengthValidator = function(str) {
  return validator.isLength(str, {min: 0, max: 42})
}

var schema = new mongoose.Schema({
  title: { type: String, required: true, validate: lengthValidator },
  locationName: String,
  latitude: Number,
  longitude: Number,
  updatedAt: Date,
  storedAt: Date,
  tags: { type: [String], default: [] },
  assignedTo: { type: mongoose.Schema.ObjectId, ref: 'User' },
  smtcTags: {type: [{type: SchemaTypes.ObjectId, ref: 'SMTCTag'}], default: []},
  creator: { type: mongoose.Schema.ObjectId, ref: 'User' },
  status: { type: String, default: 'new', required: true },
  veracity: { type: String, default: 'Unconfirmed', enum: ['Unconfirmed', 'Confirmed True','Confirmed False']},
  escalated: { type: Boolean, default: false, required: true },
  closed: { type: Boolean, default: false, required: true },
  public: { type: Boolean, default: false, required: true },
  publicDescription: String,
  // idnum: { type: Number, required: true }, mongoose-sequence now creates this field for us
  totalReports: { type: Number, default: 0, min: 0 },
  notes: String
});

schema.pre('save', function(next) {
  if (this.isNew) this.storedAt = new Date();
  this.updatedAt = new Date();
  if (!_.contains(Group.statusOptions, this.status)) {
    return next(new Error.Validation('status_error'));
  }

  next();
});

schema.post('save', function() {
  schema.emit('group:save', { _id: this._id.toString() });
});

schema.post('remove', function() {
  // Unlink removed group from reports
  Report.find({ _group: this._id.toString() }, function(err, reports) {
    if (err) {
      logger.error(err);
    }
    reports.forEach(function(report) {
      report._group = null;
      report.save();
    });
  });

});

schema.methods.addSMTCTag = function(smtcTagId, callback) {
  // TODO: Use Functional Programming
  // ML This finds the smtcTag to add (if it doesn't exists) then add it.
  let isRepeat = false;
  this.smtcTags.forEach(function(tag) {
    if(smtcTagId === tag.toString()) {
      isRepeat = true;
    }
  });
  if (isRepeat === false) {
    this.smtcTags.push({_id: smtcTagId});
  }
  callback();
}

schema.methods.removeSMTCTag = function(smtcTagId, callback) {
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
  callback();
}

schema.methods.clearSMTCTags = function(callback) {

  const cb = () => {
    this.smtcTags = [];
    callback();
  }

  if (!this.commentTo) {
    var remaining = this.smtcTags.length;
    this.smtcTags.forEach((tag) => {
      const tagId = tag.toString();
      this.removeSMTCTag(tagId, (err) => {
        if (err) {
          logger.error(err);
        }
        if (--remaining === 0) {
          cb();
        }
      });
    });
    return;
  }
  cb();
}

schema.plugin(AutoIncrement, { inc_field: 'idnum' });
var Group = mongoose.model('Group', schema);

/* We need to be able to find Groups by smtcTag Id
SMTCTag.schema.on('tag:removed', function(id) {
  Group.find({smtcTags: id}, function(err, reports) {
    if (err) {
      logger.error(err);
    }
    reports.forEach(function(report) {
      report.removeSMTCTag(id, () => {
        report.save();
      })
    });
  });
})*/

Report.schema.on('change:group', function(prevGroup, newGroup) {
  if (prevGroup !== newGroup) {
    if (prevGroup) {
      // Callbacks added to execute query immediately
      Group.findByIdAndUpdate(prevGroup, { $inc: { totalReports: -1 } }, function(err) {
        if (err) {
          logger.error(err);
        }
        schema.emit('group:update');
      });
    }
  }

  if (newGroup) {
    Group.findByIdAndUpdate(newGroup, { $inc: { totalReports: 1 } }, function(err) {
      if (err) {
        logger.error(err);
      }
      schema.emit('group:update');
    });
  }
});

// Query groups based on passed query data
Group.queryGroups = function(query, page, options, callback) {
  if (typeof query === 'function') return Group.findPage(query);
  if (typeof page === 'function') {
    callback = page;
    page = 0;
    options = {};
  }

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (page < 0) page = 0;

  var filter = {};
  options.limit = 100;

  // Create filter object
  Group.filterAttributes.forEach(function(attr) {
    if (!_.isUndefined(query[attr])) filter[attr] = query[attr];
  });

  // Return only newer results
  if (query.since) {
    filter.storedAt = filter.storedAt || {};
    filter.storedAt.$gte = query.since;
  }

  if (query.veracity === 'confirmed true') filter.veracity = 'Confirmed True';
  if (query.veracity === 'confirmed false') filter.veracity = 'Confirmed False';
  if (query.veracity === 'unconfirmed') filter.veracity = 'Unconfirmed';

  if (query.status === 'open') filter.closed = false;
  if (query.status === 'closed') filter.closed = true;
  delete filter.status;
  if (_.isBoolean(query.closed)) filter.closed = query.closed;

  if (query.escalated === 'escalated') filter.escalated = true;
  if (query.escalated === 'unescalated') filter.escalated = false;

  if (query.public === 'public') filter.public = true;
  if (query.public === 'private') filter.public = false;

  // Search for substrings
  if (query.title) filter.title = new RegExp(query.title, 'i');
  else delete filter.title;
  if (query.locationName) filter.locationName = new RegExp(query.locationName, 'i');
  else delete filter.locationName;

  // Checking for multiple tags in group
  if (filter.tags) {
    filter.smtcTags = { $all: filter.tags };
    delete filter.tags;
  }
  // Re-set search timestamp
  query.since = new Date();

  // Just use filters when no keywords are provided
  Group.findPage(filter, page, options, callback);
};

// Mixin shared group methods
var Shared = require('../shared/group');
for (var staticVar in Shared) Group[staticVar] = Shared[staticVar];
for (var proto in Shared.prototype) schema.methods[proto] = Shared[proto];

module.exports = Group;
