var _ = require('underscore');

var ReportQueue = function() {
  this.bots = [];
  this.pointer = 0;
  var self = this;
  process.on('bot:notEmpty', function(bot) {
    self.enqueue(bot);
  });
  process.on('bot:empty', function(bot) {
    self.dequeue(bot);
  });
};

ReportQueue.prototype.enqueue = function(bot) {
  this.bots.push(bot);
};

ReportQueue.prototype.dequeue = function(bot) {
  this.bots = _.without(this.bots, bot);
};

ReportQueue.prototype.nextBot = function() {
  var length = this.bots.length;
  if (length === 0) return;
  if (this.pointer >= length) this.pointer = 0;
  return this.bots[this.pointer++];
};

ReportQueue.prototype.nextReport = function() {
  return this.nextBot().fetchNext();
};

module.exports = new ReportQueue();
