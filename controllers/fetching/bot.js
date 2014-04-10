var CircularQueue = require('./circular-queue');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var logger = require('../logger');

var Bot = function(contentService) {
  this.contentService = this.contentService || contentService;
  this.type = this.contentService.botType;
  this.queue = new CircularQueue(contentService.queueCapacity);
  this.enabled = false;
};

util.inherits(Bot, EventEmitter);

Bot.prototype.start = function() {
  if (this.enabled) return;
  this.enabled = true;
  var self = this;
  this.contentService.on('reports', function(reports_data) {
    if (self.enabled) {
      if (self.isEmpty()) self.emit('notEmpty');
      reports_data.forEach(function(report_data) {
        var drops = self.queue.drops;
        self.queue.add(report_data);
        // Monitor dropped reports
        if (self.queue.drops > drops) self.logDrops();
      });
      self.emit('reports', reports_data);
    }
  });
  this.on('warning', function(warning) {
    logger.warning(warning);
  });
  this.contentService.on('warning', function(warning) {
    logger.warning(warning);
  });
  this.contentService.on('error', function(error) {
    self.stop();
    logger.error(error);
  });
};

// Variable to determine whether the Bot needs to log dropped reports.
// First element is for timeout, second element is for notEmpty event.
Bot.prototype._logDrops = [true, true];
Bot.prototype.logDrops = function() {
  if (_.all(this._logDrops)) {
    this.emit('warning', new Error('Queue full, reports being dropped. Monitor queue status for updates.'));
    this._logDrops = [false, false];
    var self = this;
    setTimeout(function() {
      self._logDrops[0] = true;
    }, 60000);
    this.once('notEmpty', function() {
      self._logDrops[1] = true;
    });
  }
};

Bot.prototype.stop = function() {
  this.enabled = false;
  this.contentService.removeAllListeners('reports');
  this.contentService.removeAllListeners('warning');
  this.contentService.removeAllListeners('error');
  this.removeAllListeners('error');
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
