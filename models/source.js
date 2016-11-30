// Represents a single source of data, e.g. a single Facebook page or RSS feed.
// Sources keep track of any errors or warnings that are encountered during fetching.
// They also track how many of these errors have been 'read' so that the user can be notified if new errors
// have occurred since they last checked.
// The actual fetching is handled by the fetching module.

var database = require('../lib/database');
var mongoose = database.mongoose;
var validate = require('mongoose-validator');
var _ = require('underscore');
require('../lib/error');

var EVENTS_TO_RETURN = 50;

var lengthValidator = validate({
  validator: 'isLength',
  arguments: [0, 20]
});

var urlValidator = validate({
  validator: 'isURL',
  passIfEmpty: true
});

var mediaValues = ['facebook', 'elmo', 'twitter', 'rss', 'dummy', 'smsgh', 'whatsapp', 'dummy-pull', 'dummy-fast'];

var sourceSchema = new mongoose.Schema({
  media: { type: String, enum: mediaValues },
  nickname: { type: String, required: true, validate: lengthValidator },
  resource_id: String,
  url: { type: String, validate: urlValidator },
  keywords: String,
  enabled: { type: Boolean, default: true },
  events: { type: Array, default: [] },
  unreadErrorCount: { type: Number, default: 0 },
  lastReportDate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  tags: { type: [String], default: [] }
});

sourceSchema.pre('save', function(next) {
  // Do not allow changing media
  if (!this.isNew && this.isModified('media')) return next(new Error.Validation('source_media_change_not_allowed'));
  // Notify when changing error count
  if (!this.isNew && this.isModified('unreadErrorCount')) {
    this._sourceErrorCountUpdated = true;
  }

  if (!this.isNew && this.isModified('enabled')) {
    this._sourceStatusChanged = true;
  }

  process.nextTick(next);
});

sourceSchema.post('save', function() {
  if (!this._silent) {
    sourceSchema.emit('source:save', { _id: this._id.toString() });
  }

  if (this._sourceStatusChanged) {
    var event = this.enabled ? 'source:enable' : 'source:disable';
    sourceSchema.emit(event, { _id: this._id.toString() });
  }

  if (this._sourceErrorCountUpdated) {
    sourceSchema.emit('sourceErrorCountUpdated');
  }
});

sourceSchema.pre('remove', function(next) {
  sourceSchema.emit('source:remove', { _id: this._id.toString() });
  next();
});

// Enable source
sourceSchema.methods.enable = function() {
  this.enabled = true;
};

// Disable source
sourceSchema.methods.disable = function() {
  this.enabled = false;
};

// Log events in source
sourceSchema.methods.logEvent = function(level, message, callback) {
  this.events.push({ datetime: new Date(), type: level, message: message });
  if (level === 'error') this.disable();
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
    { $group: { _id: null, unreadErrorCount: { $sum: '$unreadErrorCount' } } }
  ];
  Source.aggregate(pipeline, function(err, total) {
    if (err) callback(err);
    else if (total.length === 0) callback(null, 0);
    else callback(null, total[0].unreadErrorCount);
  });
};

Source.getMediaValues = function() {
  return mediaValues;
};
module.exports = Source;
