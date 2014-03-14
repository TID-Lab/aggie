var EventEmitter = require('events').EventEmitter;
var util = require('util');

var CircularQueue = function(size) {
  this.size = size || 50;
  this.start = 0;
  this.length = 0;
  this.elements = new Array(this.size);
  EventEmitter.call(this);
};

util.inherits(CircularQueue, EventEmitter);

CircularQueue.prototype.add = function(element) {
  var end = (this.start + this.length) % this.size;
  var dropped = this.peek(end);
  this.elements[end] = element;
  if (this.isFull()) {
    this.start = (this.start + 1) % this.size;
  } else {
    this.length++;
  }
  this.emit('add', element);
  if (dropped) this.emit('drop', dropped);
  return this.length;
};

CircularQueue.prototype.peek = function(i) {
  var element = this.elements[i || this.start];
  return util._extend(element);
};

CircularQueue.prototype.fetch = function() {
  var element = this.peek();
  if (element) {
    this.length--;
    this.start = (this.start + 1) % this.size;
  }
  this.emit('fetch', element);
  return element;
};

CircularQueue.prototype.isEmpty = function() {
  return this.length === 0;
};

CircularQueue.prototype.isFull = function() {
  return this.length === this.size;
};

module.exports = CircularQueue;
