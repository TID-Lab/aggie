var data = [
  { text: 'Lorem ipsum dolor sit amet' },
  { text: 'The quick brown fox jumps over the lazy dog' },
  { text: 'Hello world!' },
  { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { text: 'abcdefghijklmnopqrstuvwxyx' },
  { text: '0123456789' },
];

var ContentService = require('../content-service');
var util = require('util');

var DummyContentService = function(options) {
  if (typeof options === 'string') {
    this.filter = options;
  } else {
    this.filter = options.filter;
  }
  this.type = 'dummy';
};

util.inherits(DummyContentService, ContentService);

// Start/resume streaming of filtered data
DummyContentService.prototype.start = function() {
  var self = this;
  this._isStreaming = true;
  for (var i in data) {
    // Emit new data every 500ms
    setTimeout(this.parse, 500, this, data[i]);
  }
};

DummyContentService.prototype.parse = function(self, report) {
  var pattern = new RegExp(self.filter, 'im');
  if (self._isStreaming && pattern.test(report.text)) {
    self.emit('data', report);
  }
};

// Stop the stream
DummyContentService.prototype.stop = function() {
  this._isStreaming = false;
};

module.exports = DummyContentService;
