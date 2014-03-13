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

Bot.prototype.start = function() {
  if (this.enabled) return;
  var self = this;
  self.enabled = true;
  self.contentService.on('data', function(data) {
    if (self.enabled) {
      data = self.contentService.parse(data);
      self.emit('data', data);
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
  this.emit('report', this.queue);
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

module.exports = Bot;
