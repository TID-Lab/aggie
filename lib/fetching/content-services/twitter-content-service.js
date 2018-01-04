// Fetches tweets from Twitters streaming service, which uses keyword search.
'use strict';

var Twit = require('twit');
var ContentService = require('../content-service');
var config = require('../../../config/secrets');
var util = require('util');
var _ = require('lodash');
var tweetMatches = require('tweet-matches');

function TwitterContentService() {
  this._twit = new Twit(_.clone(config.get().twitter));
  this._connectedSources = {};
  this._compiledQueries = {};
  this.fetchType = 'subscribe';
  this._isStreaming = false;
  this._streamName = 'statuses/filter';
}

util.inherits(TwitterContentService, ContentService);

TwitterContentService.prototype.subscribe = function(id, info) {
  this._connectedSources[id] = info;
  this._compiledQueries[id] = tweetMatches.compile(info.keywords);
  this._keywords = getQuery(this._connectedSources);
  if (this._isStreaming) this._stop();
  this._start();
  return 'tweet:' + id;
};

TwitterContentService.prototype.unsubscribe = function(id) {
  delete this._connectedSources[id];
  delete this._compiledQueries[id];
  this._keywords = getQuery(this._connectedSources);
  this._stop();
  if (_.keys(this._connectedSources).length > 0) this._start();
};

function getQuery(sources) {
  return _.map(_.values(sources), 'keywords').join(',');
}

// Start/resume streaming of filtered data
TwitterContentService.prototype._start = function() {
  if (this._isStreaming) return;
  this._stream = this._getStream();
  this._addListeners();
  this._isStreaming = true;
};

// Stop the stream
TwitterContentService.prototype._stop = function() {
  if (this._stream) {
    this._stream.stop();
    delete this._stream;
  }
  this._isStreaming = false;
};

// Wrapper for stream event listener
TwitterContentService.prototype._addListeners = function() {
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
    self._makeReport(tweet);
  });
  this._stream.on('limit', function(message) {
    self.emit('warning', new Error('Twitter sent rate limitation: ' + JSON.stringify(message.limit)));
  });
  this._stream.on('disconnect', function(message) {
    self.emit('warning', new Error('Twitter sent disconnect: ' + JSON.stringify(message.disconnect)));
  });
  this._stream.on('reconnect', function(request, response, connectInterval) {
    self.emit('warning', new Error('Reconnecting to Twitter in ' + connectInterval / 1000 + ' seconds'));
  });
  this._stream.on('warning', function(message) {
    self.emit('warning', new Error('Twitter sent warning: ' + JSON.stringify(message.warning)));
  });
};

// Determine which subscribed bots match this report, and send it to one of them
// If we send it to all that match, it will be duplicated!
TwitterContentService.prototype._makeReport = function(tweet) {
  var self = this;
  var matchingBots = _.pickBy(this._connectedSources, function(ignore, botId) {
    var compiled = self._compiledQueries[botId];
    var b = tweetMatches(tweet, compiled);
    return b;
  });
  tweet._sources = _.values(_.mapValues(matchingBots, 'sourceId'));
  tweet._sourceNicknames = _.values(_.mapValues(matchingBots, 'sourceName'));
  var botIds = _.keys(matchingBots);
  if (botIds.length === 0) {
    throw new Error('tweet-matches failed with keywords ' + this._keywords + ' on tweet http://twitter.com/' + (tweet.user && tweet.user.name) + '/status/' + tweet.id_str);
  }
  this.emit('tweet:' + botIds[0], this._parse(tweet));
};

// Gets a Twit stream object
TwitterContentService.prototype._getStream = function() {
  return this._twit.stream(this._streamName, { track: this._keywords });
};

TwitterContentService.prototype._parse = function(data) {
  var author = data.user ? data.user.screen_name : null;
  var metadata = {
    tweetID: data.id_str ? data.id_str : null,
    retweet: data.retweeted_status ? true : false,
    replyTo: data.in_reply_to_status_id_str ? data.in_reply_to_status_id_str : '',
    location: data.user.location ? data.user.location : '',
    verified: data.user.verified ? data.user.verified : false,
    followerCount: data.user.followers_count ? data.user.followers_count : 0,
    friendCount: data.user.friends_count ? data.user.friends_count : 0,
    geoEnabled: data.user.geo_enabled ? data.user.geo_enabled : false,
    latitude: data.coordinates ? data.coordinates[0] : 0,
    longitude: data.coordinates ? data.coordinates[1] : 0,
    retweetCount: data.retweet_count ? data.retweet_count : 0,
    favouriteCount: data.favorite_count ? data.favorite_count : 0
  };
  return {
    authoredAt: new Date(data.created_at),
    fetchedAt: new Date(),
    content: data.text,
    author: author,
    metadata: metadata,
    url: author ? 'https://twitter.com/' + author + '/status/' + data.id_str : null,
    _sources: data._sources,
    _sourceNicknames: data._sourceNicknames
  };
};

TwitterContentService.prototype.reloadSettings = function() {
  this._stop();
  delete this._stream;
  delete this._twit;

  this._twit = new Twit(_.clone(config.get().twitter));
  this._start();
};

module.exports = new TwitterContentService();
