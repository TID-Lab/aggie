// Fetches tweets from Twitters streaming service, which uses keyword search.

var Twit = require('twit');
var config = require('../../../config/secrets').twitter;
var ContentService = require('../content-service');
var util = require('util');
var logger = require('../../logger');

var TwitterContentService = function(options) {
  this._twit = new Twit(config);
  this._keywords = options.keywords;
  this._sourceType = 'twitter';
  this.botType = 'push';
  this._isStreaming = false;
  ContentService.call(this);
};

util.inherits(TwitterContentService, ContentService);

// Set/change filter stream
TwitterContentService.prototype.setFilterStream = function(keywords) {
  if (typeof keywords === 'string') {
    this._keywords = keywords;
  }
};

// Start/resume streaming of filtered data
TwitterContentService.prototype.start = function() {
  if (this._isStreaming) return;
  if (this._stream) {
    this._stream.start();
  } else {
    this._streamName = 'statuses/filter';
    this._stream = this._twit.stream(this._streamName, {track: this._keywords});
    this.addListeners();
  }
  this._isStreaming = true;
  logger('TwitterContentService#start');
  logger.debug(this);
};

// Stop the stream
TwitterContentService.prototype.stop = function() {
  if (this._stream) {
    this._stream.stop();
  }
  this._isStreaming = false;
  logger('TwitterContentService#stop');
  logger.debug(this);
};

// Wrapper for stream event listener
TwitterContentService.prototype.addListeners = function() {
  if (this._stream) {
    // Avoid re-adding the same listeners
    var listeners = this._stream.listeners('tweet');
    if (listeners.length !== 0) return;
  } else {
    // Bail if stream has not been started
    return;
  }
  var self = this;
  this._stream.on('tweet', function(tweet) {
    self.emit('report', self._parse(tweet));
  });
  this._stream.on('limit', function(message) {
    self.emit('warning', new Error('Twitter sent rate limitation: ' + JSON.stringify(message.limit)));
  });
  this._stream.on('disconnect', function(message) {
    self.emit('warning', new Error('Twitter sent disconnect: ' + JSON.stringify(message.disconnect)));
  });
  this._stream.on('reconnect', function(request, response, connectInterval) {
    self.emit('warning', new Error('Reconnecting to Twitter in ' + (connectInterval / 1000) + ' seconds'));
  });
  this._stream.on('warning', function(message) {
    self.emit('warning', new Error('Twitter sent warning: ' + JSON.stringify(message.warning)));
  });
};

TwitterContentService.prototype._parse = function(data) {
  var author = data.user ? data.user.screen_name : null;
  return {
    authoredAt: data.created_at,
    fetchedAt: new Date(),
    content: data.text,
    author: author,
    url: author ? 'https://twitter.com/' + author + '/status/' + data.id_str : null
  };
};

module.exports = TwitterContentService;
