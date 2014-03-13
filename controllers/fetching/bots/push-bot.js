var Bot = require('../bot');
var ContentService = require('../content-service');
var Report = require('../../../models/report');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var PushBot = function(options) {
  options = options || {};
  options.source = options.source || 'dummy';
  options.filter = options.filter || '';
  this.contentService = new ContentService(options);
  EventEmitter.call(this);
};

util.inherits(PushBot, Bot);

PushBot.prototype.start = function() {
  this.contentService.start();
  PushBot.super_.prototype.start.apply(this);
};

PushBot.prototype.stop = function() {
  this.contentService.stop();
  PushBot.super_.prototype.stop.apply(this);
};

module.exports = PushBot;
