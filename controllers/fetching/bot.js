var ContentService = require('./content-service');
var CircularQueue = require('./circular-queue');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Bot = function(contentService) {
  this.contentService = this.contentService || contentService;
  this.type = this.contentService.type;
  this.queue = new CircularQueue();
  this.enabled = false;
  EventEmitter.call(this);
};

util.inherits(Bot, EventEmitter);

Bot.prototype.start = function() {
  if (this.enabled) return;
  var self = this;
  self.enabled = true;
  self.contentService.on('report', function(report_data) {
    if (self.enabled) {
      self.queue.add(report_data);
      self.emit('report', report_data);
    }
  });
};

Bot.prototype.stop = function() {
  var self = this;
  this.enabled = false;
  this.contentService.removeListener('report', function() {
    self.emit('stop');
  });
};

Bot.prototype.fetchNext = function() {
  return this.queue.fetch();
};

module.exports = function factory(options) {
  var contentService = ContentService(options);
  var SubBot = botType(contentService);
  return new SubBot(contentService);
};

module.exports.Bot = Bot;

var botType = function(contentService) {
  return require('./bots/' + contentService.type + '-bot');
};
