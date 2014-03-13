var data = [
  { text: 'Lorem ipsum dolor sit amet' },
  { text: 'The quick brown fox jumps over the lazy dog' },
  { text: 'Hello world!' },
  { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { text: 'abcdefghijklmnopqrstuvwxyx' },
  { text: '0123456789' },
];

var Report = require('../../../models/report');
var ContentService = require('../content-service');
var util = require('util');

var DummyContentService = function(options) {
  if (typeof options === 'string') {
    this.filter = options;
  } else {
    this.filter = options.filter;
  }
  this.source = 'dummy';
  this.type = 'push';
  this.bufferLength = 2;
};

util.inherits(DummyContentService, ContentService);

// Start/resume streaming of filtered data
DummyContentService.prototype.start = function() {
  var self = this;
  this._isStreaming = true;
  for (var i in data) {
    // Emit new data every 500ms
    setTimeout(this.fetch, 500, this, data[i]);
  }
};

DummyContentService.prototype.fetch = function(self, report) {
  var pattern = new RegExp(self.filter, 'im');
  if (self._isStreaming && pattern.test(report.text)) {
    self.emit('data', report);
  }
};

DummyContentService.prototype.parse = function(data) {
  return new Report({
    content: data.text,
    fetchedAt: Date.now()
  });
};

// Stop the stream
DummyContentService.prototype.stop = function() {
  this._isStreaming = false;
};

module.exports = DummyContentService;
