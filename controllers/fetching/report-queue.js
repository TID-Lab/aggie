var botMaster = require('./bot-master');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ReportQueue = function() {
  this._bots = [];
  this._pointer = 0;
  EventEmitter.call(this);

  var self = this;
  // Listen to (not)empty events from Bot Master
  botMaster.on('bot:notEmpty', function(bot) {
    var isEmpty = false;
    if (self.isEmpty()) isEmpty = true;
    self.enqueue(bot);
    // Emit event in the next cycle to allow binding of listeners
    process.nextTick(function() {
      if (isEmpty) self.emit('notEmpty');
    });
  });
  botMaster.on('bot:empty', function(bot) {
    self.dequeue(bot);
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
