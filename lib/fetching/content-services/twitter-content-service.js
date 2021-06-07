// Fetches tweets from Twitters streaming service, which uses keyword search.
'use strict';

var Twit = require('twit');
var ContentService = require('../content-service');
var config = require('../../../config/secrets');
var util = require('util');
var _ = require('lodash');
var tweetMatches = require('tweet-matches');
var Promise = require('promise');
var lang = require('langdetect-ensemble')
var fs = require('fs');
var parTweet = require('twitter-text')


var dir_models = __dirname + '/../../../shared/FastTextModels/'

function TwitterContentService() {
  let _this = this;
  this._twit = new Twit(_.clone(
      {
        consumer_key: config.get().twitter.API_key,
        consumer_secret: config.get().twitter.API_key_secret,
        access_token: config.get().twitter.access_token,
        access_token_secret: config.get().twitter.access_token_secret,
      }
  ));
  this._connectedSources = {};
  this._compiledQueries = {};
  this.fetchType = 'subscribe';
  this._isStreaming = false;
  this._streamName = 'statuses/filter';
  this.detectHateSpeech = config.get().detectHateSpeech;
  this.langDet = new lang.langDetect()

  this.langDet.addModelFromFolder(dir_models)
  // Assuming we are using three models: Franc, custom-made Ethiopic FastText (by JN), and lid.176 by Facebook
  this.langDet.setWeights([0.3, 0.4, 0.3])
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
  if (self.detectHateSpeech){
    var hateSpeechRequests = [{"data" : tweet, "request" : ContentService.prototype.getHateSpeechRequest(tweet.text ? tweet.text : "")}];
    Promise.all(hateSpeechRequests.map(function(x){return x.request})).then(
      function(hateSpeechResults){
        hateSpeechResults.forEach((hateSpeechResult, index)=>{
          hateSpeechRequests[index].data.hateSpeechScore = hateSpeechResult.result.hateSpeechScore;
        });
        return hateSpeechRequests;
      }
    ).then((hateSpeechRequests) => {
      //hateSpeechRequests will always have one element because Twitter gets tweets
      //one at a time.
      self.emit('tweet:' + botIds[0], this._parse(hateSpeechRequests[0].data));
    });
  }
  else{
    Promise.all([this._parse(tweet)]).then(function(res) {
      console.log(self._cleanTweet(res[0].content))
      console.log('#################################')
      self.emit('tweet:' + botIds[0], res[0]);
    });
  }
};

// Gets a Twit stream object
TwitterContentService.prototype._getStream = function() {
  return this._twit.stream(this._streamName, { track: this._keywords });
};

TwitterContentService.prototype._cleanTweet = function(tweet) {
  tweet = tweet.replace(/\n|\r/g, "");
  tweet = tweet.replace(/RT\s/g, "");
  var mentionIdx = parTweet.extractMentionsWithIndices(tweet)
  var hashtagIdx = parTweet.extractHashtagsWithIndices(tweet)
  var urlIdx = parTweet.extractUrlsWithIndices(tweet)
  var combinedIdx = mentionIdx.concat(urlIdx, hashtagIdx).map(i => i['indices'])
  combinedIdx = combinedIdx.sort(function f(f1, f2) {
    let s1 = f1[0] + f1[1];
    let s2 = f2[0] + f2[1];
    if (s1 < s2) {
      return -1;
    }
    if (s1 > s2) {
      return 1;
    }
    // a must be equal to b
    return 0;
  })
  let outString = ""
  let currIdx = 0;
  let currInt = 0;
  while (currIdx < tweet.length) {
    let checkInt = combinedIdx[currInt];
    if ((currIdx <= combinedIdx[combinedIdx.length - 1][1]) && (currIdx >= checkInt[0] && currIdx <= checkInt[1])) {
      if (currIdx == combinedIdx[currInt][1]) {
        currInt++;
      }
      currIdx++
      continue
    }
    else {
      outString += tweet[currIdx]
      currIdx++;
    }
  }
  return outString;
}

TwitterContentService.prototype._parse = async function(data) {
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
    favouriteCount: data.favorite_count ? data.favorite_count : 0,
    hateSpeechScore: data.hateSpeechScore || null,
    rawAPIResponse: data
  };

  let content_lang = 'und'


  let cleaned_text = this._cleanTweet(data.text)
  if (cleaned_text.length >= 10) {
    content_lang = await this.langDet.predict(cleaned_text)
  }

  let ret = {
      authoredAt: new Date(data.created_at),
      fetchedAt: new Date(),
      content: data.text,
      author: author,
      metadata: metadata,
      url: author ? 'https://twitter.com/' + author + '/status/' + data.id_str : null,
      _sources: data._sources,
      _sourceNicknames: data._sourceNicknames,
      content_lang: content_lang
  }
  // console.log(ret)
  return Promise.resolve(ret);
};

TwitterContentService.prototype.reloadSettings = function() {
  this._stop();
  delete this._stream;
  delete this._twit;

  this._twit =  new Twit(_.clone(
      {
        consumer_key: config.get().twitter.API_key,
        consumer_secret: config.get().twitter.API_key_secret,
        access_token: config.get().twitter.access_token,
        access_token_secret: config.get().twitter.access_token_secret,
      }
  ));

  this._start();
};

module.exports = TwitterContentService;
