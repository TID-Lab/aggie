// Used for testing purposes.

var data = [
  { text: 'Lorem ipsum dolor sit amet' },
  { text: 'The quick brown fox jumps over the lazy dog' },
  { text: 'Hello world!' },
  { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { text: 'abcdefghijklmnopqrstuvwxyx' },
  { text: '1 one' },
  { text: '2 two' },
  { text: '3 three' },
  { text: '4 four' },
  { text: 'One one' },
  { text: 'Two two' },
  { text: 'Three three' },
  { text: 'Four four' }
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

  // If still streaming, emit next fake report in one millisecond.
  if (this._isStreaming)
    setTimeout(function() { self._emitNext(); }, 1);
};

// Stop the stream
DummyContentService.prototype.stop = function() {
  this._isStreaming = false;
};

module.exports = DummyContentService;
