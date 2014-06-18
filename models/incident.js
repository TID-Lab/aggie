var database = require('../lib/database');
var mongoose = database.mongoose;
var Report = require('./report');
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
  notes: String
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
  schema.emit('incident:save', {_id: this._id.toString()});
});

var Incident = mongoose.model('Incident', schema);

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
    if (!incidents.results.length) return callback(null, incidents);
    var remaining = incidents.results.length;
    _.each(incidents.results, function(incident, i) {
      Report.count({_incident: incident._id.toString()}, function(err, reportCount) {
        if (err) return callback(err);
        incidents.results[i] = _.extend(incident.toJSON(), {reportCount: reportCount});
        if (--remaining === 0) callback(null, incidents);
      });
    });
  });
};

// Mixin shared incident methods
var Shared = require('../shared/incident');
for (var static in Shared) Incident[static] = Shared[static];
for (var proto in Shared.prototype) schema.methods[proto] = Shared[proto];

module.exports = Incident;
