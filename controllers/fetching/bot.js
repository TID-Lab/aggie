var CircularQueue = require('./circular-queue');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Bot = function(contentService) {
  this.contentService = this.contentService || contentService;
  this.type = this.contentService.botType;
  this.queue = new CircularQueue();
  this.enabled = false;
  EventEmitter.call(this);
};

util.inherits(Bot, EventEmitter);

Bot.prototype.start = function() {
  if (this.enabled) return;
  var self = this;
  self.enabled = true;
  self.contentService.on('reports', function(reports_data) {
    if (self.enabled) {
      if (self.isEmpty()) self.emit('notEmpty');
      reports_data.forEach(function(report_data) {
        self.queue.add(report_data);
      });
      self.emit('reports', reports_data);
    }
  });
};

Bot.prototype.stop = function() {
  this.enabled = false;
  this.contentService.removeAllListeners('reports');
  this.emit('stop');
};

// Fetch next available report in the queue
Bot.prototype.fetchNext = function() {
  // Return if queue is empty
  if (this.isEmpty()) return;

  var report_data = this.queue.fetch();

  // Notify of queue being empty
  if (this.isEmpty()) {
    this.emit('empty');
  }

  return report_data;
};

Bot.prototype.isEmpty = function() {
  return this.queue.isEmpty();
};

Bot.prototype.clearQueue = function() {
  this.queue.clear();
  this.emit('empty');
};

module.exports = Bot;
