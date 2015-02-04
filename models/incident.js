// An incident is an occurrence that is being monitored by the team.
// It is generally associated with one or more reports.
// Other metadata is stored with the incident to assist tracking.
// This class is responsible for executing IncidentQuerys.

var database = require('../lib/database');
var mongoose = database.mongoose;
var Schema = mongoose.Schema;
var validate = require('mongoose-validator').validate;
var _ = require('underscore');
var autoIncrement = require('mongoose-auto-increment');
var listenTo = require('mongoose-listento');
var Report = require('./report');

require('../lib/error');

var schema = new mongoose.Schema({
  title: {type: String, required: true, validate: validate('max', 32)},
  locationName: String,
  latitude: Number,
  longitude: Number,
  updatedAt: Date,
  storedAt: Date,
  assignedTo: { type: mongoose.Schema.ObjectId, ref: 'User' },
  creator: { type: mongoose.Schema.ObjectId, ref: 'User' },
  status: {type: String, default: 'new', required: true},
  veracity: {type: Boolean, default: null },
  escalated: {type: Boolean, default: false, required: true},
  closed: {type: Boolean, default: false, required: true},
  idnum: {type: Number, required: true},
  totalReports: {type: Number, default: 0},
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
  schema.emit('incident:save', {_id: this._id.toString()});
});

var Incident = mongoose.model('Incident', schema);
schema.plugin(autoIncrement.plugin, { model: 'Incident', field: 'idnum', startAt: 1 });


schema.listenTo(Report, 'change:incident', function(prevIncident, newIncident) {
  Incident.findById(prevIncident || newIncident, function(err, incident) {
    if (err || !incident) return;
    var total = incident.totalReports;

    if (prevIncident) {
      total = (total > 0) ? total - 1 : 0;
    }
    else if (newIncident) {
      total = (total) ? total + 1 : 1;
    }

    incident.totalReports = total;

    incident.save();
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

  if (query.veracity == 'confirmed true') filter.veracity = true;
  if (query.veracity == 'confirmed false') filter.veracity = false;
  if (query.veracity == 'unconfirmed') filter.veracity = null;
  if (_.isBoolean(query.veracity)) filter.veracity = query.veracity;

  if (query.status == 'open') filter.closed = false;
  if (query.status == 'closed') filter.closed = true;
  delete filter.status;
  if (_.isBoolean(query.closed)) filter.closed = query.closed;

  if (query.escalated == 'escalated') filter.escalated = true;
  if (query.escalated == 'unescalated') filter.escalated = false;

  // Search for substrings
  if (query.title) filter.title = new RegExp(query.title, 'i');
  else delete filter.title;
  if (query.locationName) filter.locationName = new RegExp(query.locationName, 'i');
  else delete filter.locationName;

  // Re-set search timestamp
  query.since = new Date();

  // Just use filters when no keywords are provided
  Incident.findPage(filter, page, options, callback);
};

// Mixin shared incident methods
var Shared = require('../shared/incident');
for (var static in Shared) Incident[static] = Shared[static];
for (var proto in Shared.prototype) schema.methods[proto] = Shared[proto];

module.exports = Incident;
