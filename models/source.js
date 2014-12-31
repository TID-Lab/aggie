// Represents a single source of data, e.g. a single Facebook page or RSS feed.
// Only one Twitter source should exist due to rate limiting. Only one is needed since OR queries can be used.
// Sources keep track of any errors or warnings that are encountered during fetching.
// They also track how many of these errors have been 'read' so that the user can be notified if new errors have occurred since they last checked.
// The actual fetching is handled by the fetching module.

var database = require('../lib/database');
var mongoose = database.mongoose;
var validate = require('mongoose-validator').validate;
var _ = require('underscore');
require('../lib/error');

var EVENTS_TO_RETURN = 50;

var sourceSchema = new mongoose.Schema({
  type: String,
  nickname: {type: String, required: true, validate: validate('max', 20)},
  resource_id: String,
  url: {type: String, validate: validate({passIfEmpty: true}, 'isUrl')},
  keywords: String,
  enabled: {type: Boolean, default: true},
  events: {type: Array, default: []},
  unreadErrorCount: {type: Number, default: 0},
  lastReportDate: Date
});

sourceSchema.pre('save', function(next) {
  // Do not allow changing type
  if (!this.isNew && this.isModified('type')) return next(new Error.Validation('source_type_change_not_allowed'));
  // Notify when changing error count
  if (!this.isNew && this.isModified('unreadErrorCount')) {
    this._sourceErrorCountUpdated = true;
  }

  // Only allow a single Twitter source
  if (this.isNew && this.type === 'twitter') {
    Source.findOne({type: 'twitter'}, function(err, source) {
      if (source) return next(new Error.Validation('only_one_twitter_allowed'));
      else next();
    });
  } else {
    process.nextTick(next);
  }
});

sourceSchema.post('save', function() {
  if (!this._silent) sourceSchema.emit('source:save', {_id: this._id.toString()});
  if (this._sourceErrorCountUpdated) sourceSchema.emit('sourceErrorCountUpdated');
});

sourceSchema.pre('remove', function(next) {
  sourceSchema.emit('source:remove', {_id: this._id.toString()});
  next();
});

// Enable source
sourceSchema.methods.enable = function() {
  if (!this.enabled) {
    this.enabled = true;
    this.save(function(err, source) {
      sourceSchema.emit('source:enable', {_id: source._id.toString()});
    });
  }
};

// Disable source
sourceSchema.methods.disable = function() {
  if (this.enabled) {
    this.enabled = false;
    this.save(function(err, source) {
      sourceSchema.emit('source:disable', {_id: source._id.toString()});
    });
  }
};

// Log events in source
sourceSchema.methods.logEvent = function(level, message, callback) {
  this.events.push({datetime: new Date(), type: level, message: message});
  if (level == 'error') this.disable();
  this.unreadErrorCount++;
  this._silent = true;
  this.save(callback);
};

var Source = mongoose.model('Source', sourceSchema);

// Get latest unread error messages
Source.findByIdWithLatestEvents = function(_id, callback) {
  Source.findById(_id, function(err, source) {
    if (err) return callback(err);
    if (!source) return callback(null, null);
    if (source.events) {
      source.events = _.chain(source.events).sortBy('datetime').last(EVENTS_TO_RETURN).value();
    }
    callback(null, source);
  });
};

// Reset unread error count back to zero
Source.resetUnreadErrorCount = function(_id, callback) {
  Source.findById(_id, '-events', function(err, source) {
    if (err) return callback(err);
    if (!source) return callback(null, null);
    if (source.unreadErrorCount === 0) return callback(null, source);
    source.unreadErrorCount = 0;
    source._silent = true;
    source.save(callback);
  });
};

// Determine total number of errors
Source.countAllErrors = function(callback) {
  var pipeline = [
    {$group: {_id: null, unreadErrorCount: {$sum: "$unreadErrorCount"}}}
  ];
  Source.aggregate(pipeline, function(err, total) {
    if (err) callback(err);
    else if (total.length === 0) callback(null, 0);
    else callback(null, total[0].unreadErrorCount);
  });
};

module.exports = Source;
