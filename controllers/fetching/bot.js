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
      reports_data.forEach(function(report_data) {
        self.queue.add(report_data);
      });
      self.emit('reports', reports_data);
    }
  });
};

Bot.prototype.stop = function() {
  var self = this;
  this.enabled = false;
  this.contentService.removeListener('reports', function() {
    self.emit('stop');
  });
};

Bot.prototype.fetchNext = function() {
  return this.queue.fetch();
};

module.exports = Bot;
