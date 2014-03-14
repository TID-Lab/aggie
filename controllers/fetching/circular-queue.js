var EventEmitter = require('events').EventEmitter;
var util = require('util');

var CircularQueue = function(capacity) {
  this.capacity = capacity || 50;
  this.data = new Array(this.capacity);
  this.size = 0;
  this.pointer = 0;
  this.next = 0;
  EventEmitter.call(this);
};

util.inherits(CircularQueue, EventEmitter);

CircularQueue.prototype.add = function(element) {
  this.next = (this.pointer + this.size) % this.capacity;
  var dropped = this.peek(this.next);
  if (dropped) this.emit('drop', dropped);
  this.data[this.next] = element;
  if (this.isFull()) {
    this.pointer = (this.pointer + 1) % this.capacity;
  } else {
    this.size++;
  }
  this.emit('add', element);
  return this.size;
};

CircularQueue.prototype.peek = function(i) {
  var element = this.data[i || this.pointer];
  return util._extend(element);
};

CircularQueue.prototype.fetch = function() {
  var element = this.peek();
  if (element) {
    this.size--;
    this.pointer = (this.pointer + 1) % this.capacity;
  }
  this.emit('fetch', element);
  return element;
};

CircularQueue.prototype.isEmpty = function() {
  return this.size === 0;
};

CircularQueue.prototype.isFull = function() {
  return this.size === this.capacity;
};

module.exports = CircularQueue;
