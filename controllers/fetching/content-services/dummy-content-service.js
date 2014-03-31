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
  this.keywords = options.keywords;
  this.sourceType = 'dummy';
  this.botType = 'push';
  this.bufferLength = 2;
  ContentService.call(this);
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

DummyContentService.prototype.fetch = function(self, data) {
  var pattern = new RegExp(self.keywords, 'im');
  if (self._isStreaming && pattern.test(data.text)) {
    var report = self.parse(data);
    self.emit('reports', [report]);
  }
};

DummyContentService.prototype.parse = function(data) {
  var report_data = {
    content: data.text,
    fetchedAt: Date.now()
  };
  return report_data;
};

// Stop the stream
DummyContentService.prototype.stop = function() {
  this._isStreaming = false;
};

module.exports = DummyContentService;
