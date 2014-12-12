// Maintains a list of bots and returns reports from them one-at-a-time via calls to nextReport.
// Note this queue is separate from the queues maintained inside each bot. This is a kind of meta-queue.
// It returns one report at a time by cycling through non-empty bots and asking for their next available report.
// Listens for bots becoming empty or not empty and removes/adds them from/to the queue.

var botMaster = require('./bot-master');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ReportQueue = function() {
  this._bots = [];
  this._pointer = 0;

  var self = this;
  // Listen to (not)empty events from Bot Master
  botMaster.on('bot:notEmpty', function(bot) {
    var wasEmpty = self.isEmpty();
    self.enqueue(bot);
    // Emit event in the next cycle to allow binding of listeners
    process.nextTick(function() {
      // Notify if queue changed from empty to not-empty
      if (wasEmpty && !self.isEmpty()) self.emit('notEmpty');
    });
  });
  botMaster.on('bot:empty', function(bot) {
    var wasEmpty = self.isEmpty();
    self.dequeue(bot);
    // Emit event in the next cycle to allow binding of listeners
    process.nextTick(function() {
      // Notify if queue changed from not-empty to empty
      if (!wasEmpty && self.isEmpty()) self.emit('empty');
    });
  });
};

util.inherits(ReportQueue, EventEmitter);

// Add bot to queue
ReportQueue.prototype.enqueue = function(bot) {
  var index = this._bots.indexOf(bot);
  if (index === -1) this._bots.push(bot);
};

// Remove bot from queue
ReportQueue.prototype.dequeue = function(bot) {
  var index = this._bots.indexOf(bot);
  if (index > -1) this._bots.splice(index, 1);
};

// Return next bot in queue. Wrap around after last one
ReportQueue.prototype.nextBot = function() {
  var length = this._bots.length;
  if (length === 0) return;
  if (this._pointer >= length) this._pointer = 0;
  return this._bots[this._pointer++];
};

// Return next queued report in the next bot in the queue
ReportQueue.prototype.nextReport = function() {
  var bot = this.nextBot();
  if (bot) return bot.fetchNext();
};

// Determine if queue is empty
ReportQueue.prototype.isEmpty = function() {
  return this._bots.length === 0;
};

// Flush bot queue
ReportQueue.prototype.clear = function() {
  this._bots = [];
  this._pointer = 0;
};

module.exports = new ReportQueue();
