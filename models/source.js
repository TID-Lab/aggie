var database = require('../controllers/database');
var mongoose = require('mongoose');
var _ = require('underscore');

var sourceSchema = new mongoose.Schema({
  type: String,
  resource_id: String,
  url: String,
  keywords: String,
  enabled: Boolean,
  events: Array,
  unreadErrorCount: Number
});

sourceSchema.post('save', function(source) {
  // Set source.silent = true to avoid emitting save event
  if (!source.silent) sourceSchema.emit('save', source.toObject());
});

sourceSchema.pre('remove', function(next) {
  // Set source.silent = true to avoid emitting remove event
  if (!this.silent) sourceSchema.emit('remove', this.toObject());
  next();
});

// Log events in source
sourceSchema.methods.logEvent = function(level, message, callback) {
  this.events.push({datetime: Date.now(), type: 'level', message: message});
  this.unreadErrorCount++;
  this.silent = true;
  this.save(callback);
};

var Source = mongoose.model('Source', sourceSchema);

// Get source from bot information
Source.findByBot = function(bot, callback) {
  if (bot._sourceId) {
    Source.findById(bot._sourceId, function(err, source) {
      if (err) callback(err);
      else callback(null, source);
    });
  } else {
    var keys = ['sourceType', 'resource_id', 'url', 'keywords'];
    var filter = _.pick(bot.contentService, keys);
    filter.type = filter.sourceType;
    delete filter.sourceType;
    Source.findOne(filter, function(err, source) {
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

module.exports = Source;
