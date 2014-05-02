var database = require('../lib/database');
var mongoose = database.mongoose;
require('../lib/error');

var schema = new mongoose.Schema({
  _query: {type: String, ref: 'Query', required: true},
  createdAt: {type: Date, default: new Date()},
  counts: {type: Array, default: []},
  enabled: {type: Boolean, default: true},
  lastEnabledAt: {type: Date, default: new Date()}
});

schema.pre('save', function(next) {
  // Do not allow changing query
  if (!this.isNew && this.isModified('_query')) return next(new Error.Validation('query_change_not_allowed'));
  next();
});

schema.post('save', function() {
  schema.emit('save', {_id: this._id.toString()});
});

schema.pre('remove', function(next) {
  schema.emit('remove', {_id: this._id.toString()});
  next();
});

// Enable trend
schema.methods.enable = function(callback) {
  callback = callback || function() {};
  if (!this.enabled) {
    this.enabled = true;
    this.lastEnabledAt = new Date();
    this.save(function(err, trend) {
      if (err) return callback(err);
      if (!trend) return callback(new Error.NotFound());
      schema.emit('enable', {_id: trend._id.toString()});
      callback();
    });
  }
};

// Disable trend
schema.methods.disable = function(callback) {
  callback = callback || function() {};
  if (this.enabled) {
    this.enabled = false;
    this.save(function(err, trend) {
      if (err) return callback(err);
      if (!trend) return callback(new Error.NotFound());
      schema.emit('disable', {_id: trend._id.toString()});
      callback();
    });
  }
};

module.exports = mongoose.model('Trend', schema);
