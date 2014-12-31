// Subclass of Bot.
// Starts and stops push-type content services.

var Bot = require('../bot');
var util = require('util');

// options.source - The source to receive from.
// options.contentService - The contentService to control.
var PushBot = function(options) {
  Bot.call(this, options);
};

util.inherits(PushBot, Bot);

PushBot.prototype.start = function() {
  PushBot.super_.prototype.start.apply(this);
  this.contentService.start();
};

PushBot.prototype.stop = function() {
  PushBot.super_.prototype.stop.apply(this);
  this.contentService.stop();
};

module.exports = PushBot;
