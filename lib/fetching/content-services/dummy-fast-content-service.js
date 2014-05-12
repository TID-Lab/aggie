var ContentService = require('../content-service');
var util = require('util');

var DummyFastContentService = function(options) {
  this.interval = options.interval || 10; // Emit report every %interval milliseconds
  this.max = options.keywords || 1000; // Emit a total of %max reports
  this.sourceType = 'dummy-fast';
  this.botType = 'push';
  this.bufferLength = 50;
  this.count = 0;
};

util.inherits(DummyFastContentService, ContentService);

// Start streaming of filtered data
DummyFastContentService.prototype.start = function() {
  this._isStreaming = true;
  this.fetchNext();
};

// Fetch current report and queue the next fetch
DummyFastContentService.prototype.fetchNext = function() {
  var self = this;
  this.fetch(function(stop) {
    // Stop if max reports were reached
    if (++self.count > self.max) {
      self.stop();
      return;
    }
    // Queue next fetch in %interval milliseconds
    setTimeout(function() {
      self.fetchNext();
    }, self.interval);
  });
};

// Fetch a new report
DummyFastContentService.prototype.fetch = function(callback) {
  // Report contains a random number as text
  var report = this.parse({text: Math.random()});
  this.emit('report', report);
  process.nextTick(callback);
};

// Normalize to Report structure
DummyFastContentService.prototype.parse = function(data) {
  var report_data = {
    content: data.text,
    fetchedAt: new Date()
  };
  return report_data;
};

// Stop the stream
DummyFastContentService.prototype.stop = function() {
  this._isStreaming = false;
};

module.exports = DummyFastContentService;
