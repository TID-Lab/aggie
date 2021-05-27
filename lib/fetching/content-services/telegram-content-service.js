var ContentService = require('../content-service');
var config = require('../../../config/secrets');
var util = require('util');
var _ = require('lodash');
var Promise = require('promise');

const TelegramBot = require('node-telegram-bot-api');
const token = config.get().telegram.HTTP_API_key;
const bot = new TelegramBot(token);

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
    this._messageListener = this._onMessage.bind(this);
    bot.on('message', this._messageListener);
    
    bot.startPolling();
    return 'message';
};

TelegramContentService.prototype.unsubscribe = function(id) {
    bot.removeListener('message', this._messageListener);
    
    delete this._messageListener;
    bot.stopPolling();
};

TelegramContentService.prototype._onMessage = function(message) {
    const report = this._parse(message);
    this.emit('message', report);
}

TelegramContentService.prototype._parse = function(message) {
    return {
	authoredAt: new Date(msg.date * 1000).toLocaleString("en-US"),
	fetchedAt: new Date(),
	content: message.text,
	author: message.from.first_name + " " + message.from.last_name,
	metadata: {
             rawAPIResponse: message,
        },
	url: "https://t.me/" + message.chat.username,
   }; 
}
