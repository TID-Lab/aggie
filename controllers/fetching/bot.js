var ContentService = require('./content-service');
var Report = require('../../models/report');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Bot = function(options) {
  options = options || {};
  options.source = options.source || 'dummy';
  options.filter = options.filter || '';
  this.contentService = new ContentService(options);
  EventEmitter.call(this);
  var SubBot = require('./bots/' + this.contentService.type + '-bot');
  return new SubBot(options);
};

util.inherits(Bot, EventEmitter);

Bot.prototype.on = function(event, callback) {
  var self = this;
  this.contentService.on(event, function(data) {
    if (event === 'data') {
      data = self.contentService.parse(data);
      callback(data);
    }
  });
};

module.exports = Bot;
