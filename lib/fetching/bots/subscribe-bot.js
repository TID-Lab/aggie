// Subclass of Bot.
// Listens to -type content services.

'use strict';

var Bot = require('../bot');
var util = require('util');

// options.source - The source to receive from.
// options.contentService - The contentService to control.
function SubscribeBot(options) {
  Bot.call(this, options);
  this.incomingEventName = null;
}

util.inherits(SubscribeBot, Bot);

SubscribeBot.prototype.start = function() {
  // console.log('reached this');
  // console.log(this.contentService);
  this.incomingEventName = this.contentService.subscribe(this.source.keywords);
  // console.log(this.incomingEventName);
  SubscribeBot.super_.prototype.start.apply(this);
};

SubscribeBot.prototype.stop = function() {
  SubscribeBot.super_.prototype.stop.apply(this);
  this.contentService.unsubscribe();
};

module.exports = SubscribeBot;
