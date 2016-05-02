// Fetches tweets from Twitters streaming service, which uses keyword search.

var Twit = require('twit');
var ContentService = require('../content-service');
var config = require('../../../config/secrets');
var util = require('util');
var _ = require('underscore');

// options.keywords - The keywords to pass to Twitter
var TwitterContentService = function(options) {
  this._twit = new Twit(_.clone(config.get().twitter));
  this._keywords = options.keywords;
  this.fetchType = 'push';
  this._isStreaming = false;
  ContentService.call(this, options);
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
    this._stream = this._getStream();
    this.addListeners();
  }
  this._isStreaming = true;
};

// Stop the stream
TwitterContentService.prototype.stop = function() {
  if (this._stream)
    this._stream.stop();

  this._isStreaming = false;
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

// Gets a Twit stream object
TwitterContentService.prototype._getStream = function() {
  return this._twit.stream(this._streamName, {track: this._keywords});
};

TwitterContentService.prototype._parse = function(data) {
  var author = data.user ? data.user.screen_name : null;
  return {
    authoredAt: new Date(data.created_at),
    fetchedAt: new Date(),
    content: data.text,
    author: author,
    url: author ? 'https://twitter.com/' + author + '/status/' + data.id_str : null
  };
};

TwitterContentService.prototype.reloadSettings = function() {
  this.stop();
  delete this._stream;
  delete this._twit;

  this._twit = new Twit(_.clone(config.get().twitter));
  this.start();
};

module.exports = TwitterContentService;
