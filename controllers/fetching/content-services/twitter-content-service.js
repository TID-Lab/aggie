var Twit = require('twit');
var config = require('../../../config/secrets').twitter;
var ContentService = require('../content-service');
var util = require('util');

var TwitterContentService = function(options) {
  this.twit = new Twit(config);
  this.keywords = options.keywords;
  this.sourceType = 'twitter';
  this.botType = 'push';
  this._isStreaming = false;
};

util.inherits(TwitterContentService, ContentService);

// Set/change filter stream
TwitterContentService.prototype.setFilterStream = function(keywords) {
  if (typeof keywords === 'string') {
    this.keywords = keywords;
  }
};

// Start/resume streaming of filtered data
TwitterContentService.prototype.start = function() {
  if (this.stream) {
    this.stream.start();
  } else {
    this.streamName = 'statuses/filter';
    this.stream = this.twit.stream(this.streamName, {track: this.keywords});
  }
  this._isStreaming = true;
};

// Stop the stream
TwitterContentService.prototype.stop = function() {
  if (this.stream) {
    this.stream.stop();
  }
  this._isStreaming = false;
};

// Wrapper for stream event listener
TwitterContentService.prototype.on = function(event, callback) {
  var self = this;
  // Create and start stream if not yet created
  if (!this.stream) {
    this.start();
  }
  event = event === 'reports' ? 'tweet' : event;
  // Listen to stream event and return it to allow chaining
  return this.stream.on(event, function(data) {
    if (event === 'tweet') {
      var report = self.parse(data);
      callback([report]);
    } else {
      callback(data);
    }
  });
};

TwitterContentService.prototype.parse = function(data) {
  var report_data = {
    authoredAt: data.created_at,
    fetchedAt: Date.now(),
    content: data.text,
    author: data.user.screen_name,
    url: 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str,
    _source: {
      type: 'twitter',
      keywords: this.keywords
    }
  };
  return report_data;
};

module.exports = TwitterContentService;
