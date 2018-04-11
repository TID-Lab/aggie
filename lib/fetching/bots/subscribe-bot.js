// Subclass of Bot.
// Listens to subscribe-type content services.

'use strict';

var Bot = require('../bot');
var util = require('util');
var uuid = require('node-uuid');

// TODO: We should only have one server listening to all subscribers
// TODO: And make sure it doesn't die easily

// var app = require('express')();
// var server = app.listen(1111);

// options.source - The source to receive from.
// options.contentService - The contentService to control.
function SubscribeBot(options) {
  Bot.call(this, options);
  this.incomingEventName = null;
  this.id = uuid.v4();
//  this.app = server;
}

util.inherits(SubscribeBot, Bot);

SubscribeBot.prototype.start = function() {
  this.incomingEventName = this.contentService.subscribe(this.id, {
    keywords: this.source.keywords,
    sourceId: this.source._id,
    sourceName: this.source.nickname
  });
  SubscribeBot.super_.prototype.start.apply(this);
};

SubscribeBot.prototype.stop = function() {
  this.contentService.unsubscribe(this.id);
  SubscribeBot.super_.prototype.stop.apply(this);
};

module.exports = SubscribeBot;
