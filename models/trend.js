var database = require('../lib/database');
var mongoose = database.mongoose;
require('../lib/error');

var schema = new mongoose.Schema({
  _query: {type: String, ref: 'Query', required: true},
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

module.exports = mongoose.model('Trend', schema);
