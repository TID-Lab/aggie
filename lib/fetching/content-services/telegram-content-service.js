var ContentService = require('../content-service');
var config = require('../../../config/secrets');
var util = require('util');
var _ = require('lodash');
//var tweetMatches = require('tweet-matches');
var Promise = require('promise');

const TelegramBot = require('node-telegram-bot-api');
const token = config.get().telegram.HTTP_API_key;
const bot = new TelegramBot(token, {polling: true});


function TelegramContentService() {
 
    this._connectedSources = {};
    this._compiledQueries = {};
    this.fetchType = 'subscribe';
    this._isStreaming = false;
    this._streamName = 'statuses/filter';
    this.detectHateSpeech = config.get().detectHateSpeech;
}

util.inherits(TelegramContentService, ContentService);

TelegramContentService.prototype.subscribe = function(id, info) {

    bot.on('message', (msg) => {
        return msg.text;
    });

    // everything below needs to be changed
    //this._connectedSources[id] = info;
    //this._compiledQueries[id] = tweetMatches.compile(info.keywords);
    //this._keywords = getQuery(this._connectedSources);
    //if (this._isStreaming) this._stop();
    //this._start();
    //return 'tweet:' + id;
};

TelegramContentService.prototype.unsubscribe = function(id) {
    bot.removeAllListeners('message');
 
    // not sure what the following does?
    //delete this._connectedSources[id];
    //delete this._compiledQueries[id];
    //this._keywords = getQuery(this._connectedSources);
    //this._stop();
    //if (_.keys(this._connectedSources).length > 0) this._start();
};
