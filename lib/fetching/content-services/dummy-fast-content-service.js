// Used for testing purposes.

var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');
var chance = new require('chance')();

var DummyFastContentService = function(options) {
  options = _.defaults(options, JSON.parse(options.keywords));
  this.interval = options.interval || 1; // Emit report every %interval milliseconds
  this.max = options.max || 1000; // Emit a total of %max reports
  this.media = 'dummy-fast';
  this.fetchType = 'dummy-push';
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
    }, self._interval());
  });
};

// Fetch a new report
DummyFastContentService.prototype.fetch = function(callback) {
  // Report contains a random number as text
  var report = this.parse({ text: chance.sentence() });
  this.emit('report', report);
  process.nextTick(callback);
};

// Normalize to Report structure
DummyFastContentService.prototype.parse = function(data) {
  var report_data = {
    content: data.text,
    fetchedAt: new Date(),
    authoredAt: chance.date(),
    author: chance.name(),
    url: chance.url()
  };
  return report_data;
};

// Stop the stream
DummyFastContentService.prototype.stop = function() {
  this._isStreaming = false;
};

// Use random jitter to avoid clustered requests
DummyFastContentService.prototype._interval = function() {
  var diff = this.interval / 10;
  return this.interval - diff + Math.floor(Math.random() * 2 * diff);
};

module.exports = DummyFastContentService;
