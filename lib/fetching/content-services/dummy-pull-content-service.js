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

var DummyPullContentService = function(options) {
  this.limit = options.limit || 2;
  this.pointer = 0;
  this.sourceType = 'dummy-pull';
  this.botType = 'pull';
  this.bufferLength = 2;
};

util.inherits(DummyPullContentService, ContentService);

// Fetch next batch of data
DummyPullContentService.prototype.fetch = function(callback) {
  var i = this.pointer;
  for (; i < (this.pointer + this.limit); i++) {
    if (!data[i]) return;
    var report = this.parse(data[i]);
    this.emit('report', report);
  }
  this.pointer = i;
  callback();
};

DummyPullContentService.prototype.parse = function(data) {
  var report_data = {
    content: data.text,
    fetchedAt: Date.now()
  };
  return report_data;
};

module.exports = DummyPullContentService;
