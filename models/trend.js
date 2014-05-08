var database = require('../lib/database');
var mongoose = database.mongoose;
var Query = require('./query');
var _ = require('underscore');
require('../lib/error');

var schema = new mongoose.Schema({
  _query: {type: String},
  keywords: {type: String, required: true},
  timebox: {type: Number, default: 300},
  createdAt: {type: Date, default: new Date()},
  counts: {type: Array, default: []},
  enabled: {type: Boolean, default: true},
  lastEnabledAt: {type: Date, default: new Date()}
});

schema.pre('save', function(next) {
  var trend = this;
  if (this.isNew) this._wasNew = true;
  // Do not allow changing query
  if (!this.isNew && this.isModified('_query')) return next(new Error.Validation('query_change_not_allowed'));
  // Determine query
  var query = new Query({type: 'Trend', keywords: this.keywords});
  var queryHash = Query.hash(query);
  Trend.findOne({_query: queryHash}, function(err, found) {
    if (err) return next(err);
    if (found) trend = found;
    else trend._query = queryHash;
    next();
  });
});

schema.post('save', function() {
  if (this._wasNew) schema.emit('save', {_id: this._id.toString()});
});

schema.pre('remove', function(next) {
  schema.emit('remove', {_id: this._id.toString()});
  next();
});

schema.methods.addTrends = function(trends) {
  var self = this;
  trends.forEach(function(trend) {
    var count = _.findWhere(self.counts, {timebox: trend.timebox});
    if (count) count.counts += trend.counts;
    else self.counts.push(trend);
  });
  // TODO Save not working
  this.save();
};

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
    return callback(new Error.Validation('invalid_status'));
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
module.exports = Trend;
