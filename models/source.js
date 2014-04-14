var database = require('../controllers/database');
var mongoose = require('mongoose');
var _ = require('underscore');

var sourceSchema = new mongoose.Schema({
  type: String,
  resource_id: String,
  url: String,
  keywords: String,
  enabled: {type: Boolean, default: true},
  events: {type: Array, default: []},
  unreadErrorCount: {type: Number, default: 0}
});

sourceSchema.post('save', function() {
  sourceSchema.emit('save', {_id: this._id.toString()});
});

sourceSchema.pre('remove', function(next) {
  sourceSchema.emit('remove', {_id: this._id.toString()});
  next();
});

// Enable source
sourceSchema.methods.enable = function() {
  if (!this.enabled) {
    this.enabled = true;
    this.save(function(err, source) {
      sourceSchema.emit('enable', {_id: source._id.toString()});
    });
  }
};

// Disable source
sourceSchema.methods.disable = function() {
  if (this.enabled) {
    this.enabled = false;
    this.save(function(err, source) {
      sourceSchema.emit('disable', {_id: source._id.toString()});
    });
  }
};

// Log events in source
sourceSchema.methods.logEvent = function(level, message, callback) {
  this.events.push({datetime: Date.now(), type: level, message: message});
  this.unreadErrorCount++;
  this.save(callback);
};

var Source = mongoose.model('Source', sourceSchema);

// Get latest unread error messages
Source.findByIdWithLatestEvents = function(_id, callback) {
  Source.findById(_id, function(err, source) {
    if (err) return callback(err);
    if (!source) return callback(null, null);
    if (source.events) {
      source.events = _.chain(source.events).sortBy('datetime').last(source.unreadErrorCount).value();
    }
    callback(null, source);
  });
};

// Reset unread error count back to zero
Source.resetUnreadErrorCount = function(_id, callback) {
  Source.findById(_id, '-events', function(err, source) {
    if (err) return callback(err);
    if (!source) return callback(null, null);
    source.unreadErrorCount = 0;
    source.save(callback);
  });
};

module.exports = Source;
