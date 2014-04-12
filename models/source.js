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

sourceSchema.pre('save', function(next) {
  if (this.isNew) sourceSchema.emit('create', this.toObject());
  next();
});

sourceSchema.pre('remove', function(next) {
  sourceSchema.emit('remove', this.toObject());
  next();
});

// Enable source
sourceSchema.methods.enable = function() {
  if (!this.enabled) {
    this.enabled = true;
    this.save(function(err, source) {
      sourceSchema.emit('enable', source.toObject());
    });
  }
};

// Disable source
sourceSchema.methods.disable = function() {
  if (this.enabled) {
    this.enabled = false;
    this.save(function(err, source) {
      sourceSchema.emit('disable', source.toObject());
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

// Get source from bot information
Source.findByBot = function(bot, callback) {
  if (bot._sourceId) {
    // If source id is included in bot, find by id
    Source.findById(bot._sourceId, function(err, source) {
      if (err) callback(err);
      else callback(null, source);
    });
  } else {
    // Find a source based on source data
    var keys = ['sourceType', 'resource_id', 'url', 'keywords'];
    var source_data = _.pick(bot.contentService, keys);
    source_data.type = source_data.sourceType;
    delete source_data.sourceType;
    Source.findOne(source_data, function(err, source) {
      if (err) return callback(err);
      callback(null, source);
    });
  }
};

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
