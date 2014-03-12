var data = [
  { text: 'Lorem ipsum dolor sit amet' },
  { text: 'The quick brown fox jumps over the lazy dog' },
  { text: 'Hello world!' },
  { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { text: 'abcdefghijklmnopqrstuvwxyx' },
  { text: '0123456789' },
];

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var DummyContentService = function(options) {
  if (typeof options === 'string') {
    this.options = {filter: options};
  } else {
    this.options = options || {};
  }
  EventEmitter.call(this);
};

var ContentService = require('../content-service');
var util = require('util');
util.inherits(DummyContentService, ContentService);
util.inherits(DummyContentService, EventEmitter);

// Start/resume streaming of filtered data
DummyContentService.prototype.start = function() {
  var self = this;
  this._isStreaming = true;
  for (var i in data) {
    // Emit new data every 500ms
    setTimeout(this.filter, 500, this, data[i]);
  }
};

DummyContentService.prototype.filter = function(self, report) {
  var pattern = new RegExp(self.options.filter, 'im');
  if (self._isStreaming && pattern.test(report.text)) {
    self.emit('data', report);
  }
};

// Stop the stream
DummyContentService.prototype.stop = function() {
  this._isStreaming = false;
};

module.exports = DummyContentService;
