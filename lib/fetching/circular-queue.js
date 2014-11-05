// Efficient circular queue data structure. Fixed capacity.
// If overflows, oldest elements are overwritten first.
// Monitors number of dropped (overwritten) elements.

var util = require('util');

var CircularQueue = function(capacity) {
  this.capacity = parseInt(capacity) || CircularQueue.DEFAULT_CAPACITY;
  this.start = 0;
  this.count = 0;
  this.drops = 0;
  this.total = 0;
  this.elements = new Array(this.capacity);
};

CircularQueue.DEFAULT_CAPACITY = 50;

CircularQueue.prototype.add = function(element) {
  var end = (this.start + this.count) % this.capacity;
  this.total++;
  var dropped = this.peek(end);
  if (dropped) this.drops++;
  this.elements[end] = element;
  if (this.isFull()) {
    this.start = (this.start + 1) % this.capacity;
  } else {
    this.count++;
  }
  return this.count;
};

CircularQueue.prototype.peek = function(i) {
  if (i === undefined) i = this.start;
  var element = this.elements[i];
  return util._extend(element);
};

CircularQueue.prototype.fetch = function() {
  var element = this.peek();
  if (element) {
    this.count--;
    this.elements[this.start] = undefined;
    this.start = (this.start + 1) % this.capacity;
  }
  return element;
};

CircularQueue.prototype.isEmpty = function() {
  return this.count === 0;
};

CircularQueue.prototype.isFull = function() {
  return this.count === this.capacity;
};

CircularQueue.prototype.clear = function() {
  this.start = 0;
  this.count = 0;
  this.elements = new Array(this.capacity);
};

module.exports = CircularQueue;
