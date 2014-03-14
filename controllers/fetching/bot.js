var ContentService = require('./content-service');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Bot = function(contentService) {
  this.contentService = this.contentService || contentService;
  this.type = this.contentService.type;
  this.enabled = false;
  EventEmitter.call(this);
};

util.inherits(Bot, EventEmitter);

Bot.prototype.start = function() {
  if (this.enabled) return;
  var self = this;
  self.enabled = true;
  self.contentService.on('report', function(data) {
    if (self.enabled) {
      self.addToQueue(data);
    }
  });
};

Bot.prototype.getQueue = function() {
  this.queue = this.queue || [];
  this.queueLimit = this.queueLimit || this.contentService.bufferLength;
  this.droppedRecords = this.droppedRecords || 0;
  return this.queue;
};

Bot.prototype.stop = function() {
  this.enabled = false;
};

Bot.prototype.addToQueue = function(report) {
  if (!this.queue) {
    this.getQueue();
  }
  this.queue.push(report);
  this.emit('report', report);
  this.emit('reports', this.queue);
  if (this.queue.length > this.contentService.bufferLength) {
    var dropped = this.queue.shift();
    this.droppedRecords++;
    this.emit('dropped', dropped);
  }
  return this.queue.length;
};

Bot.prototype.fetchNext = function() {
  if (!this.queue) {
    this.getQueue();
  }
  if (this.queue.length) {
    return this.queue.shift();
  } else {
    return null;
  }
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
