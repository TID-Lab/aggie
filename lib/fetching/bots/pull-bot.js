// Subclass of Bot.
// Polls content services at specified intervals.

var Bot = require('../bot');
var util = require('util');

var PullBot = function(options) {
  this.interval = options.interval || 120000;
  Bot.call(this, options);
};

util.inherits(PullBot, Bot);

// Start polling content service
PullBot.prototype.start = function() {
  if (this.enabled) return;
  PullBot.super_.prototype.start.apply(this);
  this.enabled = true;
  this._fetching = false;
  this.poll();
};

// Clear interval to stop polling
PullBot.prototype.stop = function() {
  this.enabled = false;
  clearTimeout(this.timeoutObject);
  PullBot.super_.prototype.stop.apply(this);
};

// Poll content service at specified intervals
PullBot.prototype.poll = function() {
  if (!this.enabled) return;
  var self = this;
  this.fetch(function(err, lastReportDate) {
    self.timeoutObject = setTimeout(function() {
      self.poll();
    }, self._interval());
    if (lastReportDate && lastReportDate != -Infinity && self.source.lastReportDate !== lastReportDate) {
      self.source.lastReportDate = lastReportDate;
      self.source.save();
    }
  });
};

// Fetch next batch of data from content service
PullBot.prototype.fetch = function(callback) {
  var maxCount = this.queue.capacity - this.queue.count;
  
  if (!this.enabled) return callback();
  if (maxCount === 0) return callback();
  
  var self = this;
  
  if (self._fetching) return callback();
  self._fetching = true;
  
  var options = {
    maxCount: maxCount
  };
  this.contentService.fetch(options, function(err, lastReportDate){
    self._fetching = false;
    callback(err, lastReportDate);
  });
};

// Use random jitter to avoid clustered requests
PullBot.prototype._interval = function() {
  var diff = this.interval / 10;
  return this.interval - diff + Math.floor(Math.random() * 2 * diff + 1);
};

module.exports = PullBot;
