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

var DummyPullContentService = function(options) {
  this.limit = options.limit || 2;
  this.pointer = 0;
  this.media = 'dummy-pull';
  this.fetchType = 'pull';
};

util.inherits(DummyPullContentService, ContentService);

// Fetch next batch of data
DummyPullContentService.prototype.fetch = function(options, callback) {
  if (options && typeof options === 'function') {
    callback = options;
    options = {};
  }
  callback = callback || function() {};

  var i = this.pointer;
  for (; i < (this.pointer + this.limit); i++) {
    if (!data[i]) return;
    var report = this._parse(data[i]);
    this.emit('report', report);
  }
  this.pointer = i;
  callback();
};

DummyPullContentService.prototype._parse = function(data) {
  var report_data = {
    content: data.text,
    fetchedAt: Date.now()
  };
  return report_data;
};

module.exports = DummyPullContentService;
