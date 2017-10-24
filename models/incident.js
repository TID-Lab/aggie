// An incident is an occurrence that is being monitored by the team.
// It is generally associated with one or more reports.
// Other metadata is stored with the incident to assist tracking.
// This class is responsible for executing IncidentQuerys.
/* eslint-disable no-invalid-this */
'use strict';

var database = require('../lib/database');
var mongoose = database.mongoose;
var validate = require('mongoose-validator');
var _ = require('underscore');
var autoIncrement = require('mongoose-auto-increment');
var listenTo = require('mongoose-listento');
var Report = require('./report');
var logger = require('../lib/logger');
var toRegexp = require('./to-regexp');

require('../lib/error');

var lengthValidator = validate({
  validator: 'isLength',
  arguments: [0, 32]
});

var schema = new mongoose.Schema({
  title: { type: String, required: true, validate: lengthValidator },
  locationName: String,
  latitude: Number,
  longitude: Number,
  updatedAt: Date,
  storedAt: Date,
  tags: { type: [String], default: [] },
  assignedTo: { type: mongoose.Schema.ObjectId, ref: 'User' },
  creator: { type: mongoose.Schema.ObjectId, ref: 'User' },
  status: { type: String, default: 'new', required: true },
  veracity: { type: Boolean, default: null },
  escalated: { type: Boolean, default: false, required: true },
  closed: { type: Boolean, default: false, required: true },
  public: { type: Boolean, default: false, required: true },
  publicDescription: String,
  idnum: { type: Number, required: true },
  totalReports: { type: Number, default: 0, min: 0 },
  notes: String
});

schema.plugin(listenTo);
autoIncrement.initialize(mongoose.connection);

schema.pre('save', function(next) {
  if (this.isNew) this.storedAt = new Date();
  this.updatedAt = new Date();
  if (!_.contains(Incident.statusOptions, this.status)) {
    return next(new Error.Validation('status_error'));
  }

  next();
});

schema.post('save', function() {
  schema.emit('incident:save', { _id: this._id.toString() });
});

schema.post('remove', function() {
  // Unlink removed incident from reports
  Report.find({ _incident: this._id.toString() }, function(err, reports) {
    if (err) {
      logger.error(err);
    }
    reports.forEach(function(report) {
      report._incident = null;
      report.save();
    });
  });

});

var Incident = mongoose.model('Incident', schema);
schema.plugin(autoIncrement.plugin, { model: 'Incident', field: 'idnum', startAt: 1 });

schema.listenTo(Report, 'change:incident', function(prevIncident, newIncident) {
  if (prevIncident !== newIncident) {
    // Callbacks added to execute query immediately
    Incident.findByIdAndUpdate(prevIncident, { $inc: { totalReports: -1 } }, function(err) {
      if (err) {
        logger.error(err);
      }
      schema.emit('incident:update');
    });
  }

  Incident.findByIdAndUpdate(newIncident, { $inc: { totalReports: 1 } }, function(err) {
    if (err) {
      logger.error(err);
    }
    schema.emit('incident:update');
  });

});

// Query incidents based on passed query data
Incident.queryIncidents = function(query, page, options, callback) {
  if (typeof query === 'function') return Incident.findPage(query);
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
  Incident.filterAttributes.forEach(function(attr) {
    if (!_.isUndefined(query[attr])) filter[attr] = query[attr];
  });

  // Return only newer results
  if (query.since) {
    filter.storedAt = filter.storedAt || {};
    filter.storedAt.$gte = query.since;
  }

  if (query.veracity === 'confirmed true') filter.veracity = true;
  if (query.veracity === 'confirmed false') filter.veracity = false;
  if (query.veracity === 'unconfirmed') filter.veracity = null;
  if (_.isBoolean(query.veracity)) filter.veracity = query.veracity;

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

  // Checking for multiple tags in incident
  if (query.tags) {
    filter.tags = { $all: toRegexp.allCaseInsensitive(query.tags) };
  } else delete filter.tags;

  // Re-set search timestamp
  query.since = new Date();

  // Just use filters when no keywords are provided
  Incident.findPage(filter, page, options, callback);
};

// Mixin shared incident methods
var Shared = require('../shared/incident');
for (var staticVar in Shared) Incident[staticVar] = Shared[staticVar];
for (var proto in Shared.prototype) schema.methods[proto] = Shared[proto];

module.exports = Incident;
