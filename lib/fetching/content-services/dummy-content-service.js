// Used for testing purposes.

var data = [
  'Lorem ipsum dolor sit amet',
  'The quick brown fox jumps over the lazy dog',
  'Hello world!',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyx',
  '1 one',
  '2 two',
  '3 three',
  '4 four',
  'One one',
  'Two two',
  'Three three',
  'Four four'
];

var ContentService = require('../content-service');
var util = require('util');

var DummyContentService = function(options) {
  this._curItem = 0;
  this.fetchType = 'push';
};

util.inherits(DummyContentService, ContentService);

// Start/resume streaming of filtered data
DummyContentService.prototype.start = function() {
  this._isStreaming = true;
  this._emitNext();
};

DummyContentService.prototype._emitNext = function() {
  var self = this;
  this.emit('report', {content: data[this._curItem], fetchedAt: new Date()});
  this._curItem += 1;

  // If still streaming, emit next fake report in one millisecond.
  if (this._isStreaming)
    setTimeout(function() { self._emitNext(); }, 1);
};

// Stop the stream
DummyContentService.prototype.stop = function() {
  this._isStreaming = false;
};

module.exports = DummyContentService;
