var CircularQueue = require('./circular-queue');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');

var Bot = function(options) {
  this.source = options.source;
  this.contentService = this.contentService || options.contentService;
  this.type = this.contentService.botType;
  this.queue = new CircularQueue(options.queueCapacity);
  this.enabled = false;
  // Variable to determine whether the Bot needs to log dropped reports.
  this._logDrops = {timeout: true, notEmpty: true};
};

util.inherits(Bot, EventEmitter);

Bot.prototype.start = function() {
  if (this.enabled) return;
  this.enabled = true;
  var self = this;
  this.contentService.on('report', function(report_data) {
    if (self.enabled) {
      if (self.isEmpty()) self.emit('notEmpty');

      // Need to add _source foreign key reference here b/c ContentService doesn't know about Source.
      report_data._source = self.source._id;
      report_data._sourceType = self.source.type;
      report_data._sourceNickname = self.source.nickname;

      var drops = self.queue.drops;
      self.queue.add(report_data);

      // If the last report was dropped, we may need to log this.
      if (self.queue.drops > drops) self.logDrops();

      self.emit('report', report_data);
    }
  });
  this.contentService.on('warning', function(warning) {
    self._handleError('warning', warning);
  });
  this.contentService.on('error', function(error) {
    self._handleError('error', error);
  });
};

Bot.prototype.logDrops = function() {
  if (_.all(_.values(this._logDrops))) {
    this._handleError('warning', new Error('Queue full, reports being dropped. Monitor queue status for updates.'));
    this._logDrops = {timeout: false, notEmpty: false};
    var self = this;
    setTimeout(function() {
      self._logDrops.timeout = true;
    }, 60000);
    this.once('notEmpty', function() {
      self._logDrops.notEmpty = true;
    });
  }
};

Bot.prototype.stop = function() {
  this.enabled = false;
  this.contentService.removeAllListeners('report');
  this.contentService.removeAllListeners('warning');
  this.contentService.removeAllListeners('error');
  this.removeAllListeners('error');
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

// Log errors
Bot.prototype._handleError = function(type, error) {
  this.source.logEvent(type, error.message);
};

module.exports = Bot;
