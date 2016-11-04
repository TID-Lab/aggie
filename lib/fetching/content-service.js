// Fetches data for a single source.
// Converts received data to a common schema and emits 'report' event with the converted data.
// See subclasses for implementation.

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');

// options.lastReportDate - The time of the last report already fetched (optional)
var ContentService = function(options) {
  this._lastReportDate = options.lastReportDate;
};

util.inherits(ContentService, EventEmitter);

// Fetches reports from the service (used only by content services for pull-type sources).
// options.maxCount - The max number of reports to fetch (required)
// callback(err, lastReportDate) - A function to call when fetching is complete. The updated
//   lastReportDate should be passed as an argument to the callback as shown.
ContentService.prototype.fetch = function(options, callback) {
  var self = this;

  // Fetch a chunk of reports (this is implemented by the child class).
  this._doFetch({ maxCount: options.maxCount }, function(reportData) {

    // Now that doFetch is over, we emit at most this._maxCount report data hashes, one at a time,
    // then call the callback.
    // _lastReportDate should end up as the time of the last emitted report.
    var emitted = 0;
    _.sortBy(reportData, 'authoredAt').every(function(rd) {
      self._lastReportDate = rd.authoredAt;
      self.emit('report', rd);
      return ++emitted < options.maxCount;
    });

    callback(null, self._lastReportDate);
  });
};

// Abstract method to be implemented by child classes to do actual fetching
ContentService.prototype._doFetch = function(options, callback) {
  throw new Error('Not yet implemented');
};

module.exports = ContentService;
