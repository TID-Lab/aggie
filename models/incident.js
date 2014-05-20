var database = require('../lib/database');
var mongoose = database.mongoose;
var _ = require('underscore');
require('../lib/error');

var schema = new mongoose.Schema({
  title: {type: String, required: true},
  locationName: String,
  latitude: Number,
  longitude: Number,
  updatedAt: Date,
  assignedTo: String,
  status: {type: String, default: 'new', required: true},
  verified: {type: Boolean, default: false, required: true},
  notes: String
});

schema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!_.contains(['new', 'working', 'alert', 'closed'], this.status)) {
    return next(new Error.Validation('status_error'));
  }
  next();
});

schema.post('save', function() {
  schema.emit('incident:save', {_id: this._id.toString()});
});

var Incident = mongoose.model('Incident', schema);

Incident.findPage = function(filters, page, callback) {
  if (typeof filters === 'function') {
    callback = filters;
    page = 0;
    filters = {};
  } else if (typeof page === 'function') {
    callback = page;
    page = 0;
  }
  if (page < 0) page = 0;
  var limit = 25;
  Incident.count(filters, function(err, count) {
    if (err) return callback(err);
    var result = {total: count};
    Incident.find(filters, null, {limit: limit, skip: page * limit, sort: '-updatedAt'}, function(err, incidents) {
      if (err) return callback(err);
      result.results = incidents;
      callback(null, result);
    });
  });
};

module.exports = Incident;
