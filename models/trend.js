var database = require('../lib/database');
var mongoose = database.mongoose;
var Query = require('./query');
var _ = require('underscore');
require('../lib/error');

var schema = new mongoose.Schema({
  _query: {type: String, required: true},
  timebox: {type: Number, default: 300},
  createdAt: {type: Date, default: new Date()},
  counts: {type: Array, default: []},
  enabled: {type: Boolean, default: true},
  lastEnabledAt: {type: Date, default: new Date()}
});

schema.pre('save', function(next) {
  if (this.isNew) this._wasNew = true;
  // Do not allow changing query
  if (!this.isNew && this.isModified('_query')) return next(new Error.Validation('query_change_not_allowed'));
  next();
});

schema.post('save', function() {
  if (this._wasNew) schema.emit('save', {_id: this._id.toString()});
});

schema.pre('remove', function(next) {
  schema.emit('remove', {_id: this._id.toString()});
  next();
});

// Toggle trend enabled status
schema.methods.toggle = function(status, callback) {
  callback = callback || function() {};

  if (status === true || status === 'enable') {
    // If changing from disabled to enabled, record date
    if (!this.enabled) this.lastEnabledAt = new Date();
    this.enabled = true;
  } else if (status === false || status === 'disable') {
    this.enabled = false;
  } else if (status === undefined) {
    if (!this.enabled) this.lastEnabledAt = new Date();
    this.enabled = !this.enabled;
  } else {
    process.nextTick(function() {
      callback(new Error.Validation('invalid_status'));
    });
    return;
  }

  var event = this.enabled ? 'enable' : 'disable';

  this.save(function(err, trend) {
    if (err) return callback(err);
    if (!trend) return callback(new Error.NotFound());
    schema.emit(event, {_id: trend._id.toString()});
    callback();
  });
};

var Trend = mongoose.model('Trend', schema);

Trend.findPageById = function(_id, page, callback) {
  if (typeof page === 'function') {
    callback = page;
    page = 0;
  }
  if (page < 0) page = 0;
  var limit = 48;
  var skip = page * limit;
  Trend.findOne({_id: _id}, {counts: {$slice: [skip, limit]}}, function(err, trend) {
    if (err) return callback(err);
    callback(null, trend);
  });
};

// Add new trend analytics to Trend model
Trend.addTrend = function(_id, trend, callback) {
  // Find corresponding trend and increment the counts
  Trend.findOneAndUpdate(
    {_id: _id, 'counts.timebox': trend.timebox},
    {$inc: {'counts.$.counts': trend.counts}},
    function(err, result) {
      if (err) return callback(err);
      if (result) {
        // Return updated trend
        callback(null, _.findWhere(result.counts, {timebox: trend.timebox}));
      } else {
        // If no prior trend found, add it to the array
        Trend.findByIdAndUpdate(_id, {$push: {counts: {$each: [trend], $sort: {timebox: -1}}}},
          function(err, result) {
            if (err) return callback(err);
            if (!result) return callback(new Error.NotFound());
            // Return updated trend
            callback(null, _.findWhere(result.counts, {timebox: trend.timebox}));
          });
      }
    });
};

module.exports = Trend;
