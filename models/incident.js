var database = require('../lib/database');
var mongoose = database.mongoose;
var validate = require('mongoose-validator').validate;
var _ = require('underscore');
require('../lib/error');

var schema = new mongoose.Schema({
  title: {type: String, required: true, validate: validate('max', 32)},
  locationName: String,
  latitude: Number,
  longitude: Number,
  updatedAt: Date,
  storedAt: Date,
  assignedTo: String,
  status: {type: String, default: 'new', required: true},
  verified: {type: Boolean, default: false, required: true},
  notes: String,
  reportCount: Number
});

schema.pre('save', function(next) {
  if (this.isNew) this.storedAt = new Date();
  this.updatedAt = new Date();
  if (!_.contains(Incident.statusOptions, this.status)) {
    return next(new Error.Validation('status_error'));
  }
  next();
});

schema.post('save', function() {
  if (!this._silent) schema.emit('incident:save', {_id: this._id.toString()});
});

var Incident = mongoose.model('Incident', schema);

// Add event listeners from other models
Incident.addListeners = function(type, emitter) {
  switch (type) {
    case 'reports':
      emitter.on('report:incident', function(report) {
        if (report._incident) Incident.updateCounts(report._incident);
        if (report._oldIncident) Incident.updateCounts(report._oldIncident);
      });
      break;
  }
};

// Update report counts for incident
Incident.updateCounts = function(_id) {
  Incident.findById(_id, function(err, incident) {
    if (err || !incident) return;
    mongoose.models.Report.count({_incident: incident._id.toString()}, function(err, reportCount) {
      if (err) return;
      incident.reportCount = reportCount;
      incident._silent = true;
      incident.save();
    });
  });
};

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

  // Search for substrings
  if (query.title) filter.title = new RegExp(query.title, 'i');
  else delete filter.title;
  if (query.locationName) filter.locationName = new RegExp(query.locationName, 'i');
  else delete filter.locationName;

  // Re-set search timestamp
  query.since = new Date();

  // Just use filters when no keywords are provided
  Incident.findPage(filter, page, options, function(err, incidents) {
    if (err) return callback(err);
    callback(null, incidents);
  });
};

// Mixin shared incident methods
var Shared = require('../shared/incident');
for (var static in Shared) Incident[static] = Shared[static];
for (var proto in Shared.prototype) schema.methods[proto] = Shared[proto];

module.exports = Incident;
