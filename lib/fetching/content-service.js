// Fetches data for a single source.
// Converts received data to a common schema and emits 'report' event with the converted data.
// See subclasses for implementation.

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');

// options.lastReportDate - The time of the last report already fetched (optional)
var ContentService = function(options) {
  this._lastReportDate = options.lastReportDate;
  this._nextPageUrl = options.nextPageUrl;
  this._nextPageUrlSavedSearch = options.nextPageUrlSavedSearch;
  this._lastReportDateSavedSearch = options.lastReportDateSavedSearch;
  this.savedSearchFetchEnabled = false;
};

util.inherits(ContentService, EventEmitter);

// Fetches reports from the service (used only by content services for pull-type sources).
// options.maxCount - The max number of reports to fetch (required)
// callback(err, lastReportDate) - A function to call when fetching is complete. The updated
//   lastReportDate should be passed as an argument to the callback as shown.
ContentService.prototype.fetch = function(options, callback) {
  var self = this;
  // Fetch a chunk of reports (this is implemented by the child class). Fetch reports alternatively from Lists and Saved Searches
  if(!self.savedSearchFetchEnabled){
    this._doFetch({ maxCount: options.maxCount, requestType: "LISTS" }, function(responseData) {
      // Now that doFetch is over, we emit at most this._maxCount report data hashes, one at a time,
      // then call the callback.
      // _lastReportDate should end up as the time of the last emitted report.
      var emitted = 0;
      self._nextPageUrl = responseData.nextPageUrl;
      _.sortBy(responseData.reportData, 'authoredAt').every(function(rd) {
        if(self._lastReportDate === undefined){
          self._lastReportDate = new Date(rd.authoredAt);
        }
        self._lastReportDate = self._lastReportDate > new  Date(rd.authoredAt) ? self._lastReportDate: new Date(rd.authoredAt);
        self.emit('report', rd);
        return ++emitted < options.maxCount;
      });
      self.savedSearchFetchEnabled = true;
      callback(null, self._lastReportDate, null);
    });
  } else{
    this._doFetch({ maxCount: options.maxCount, requestType: "SAVED_SEARCH" }, function(responseData) {

      // Now that doFetch is over, we emit at most this._maxCount report data hashes, one at a time,
      // then call the callback.
      // _lastReportDateSavedSearch should end up as the time of the last emitted Saved Search report.
      var emitted = 0;
      self._nextPageUrlSavedSearch = responseData.nextPageUrl;
      _.sortBy(responseData.reportData, 'authoredAt').every(function(rd) {
        if(self._lastReportDateSavedSearch === undefined){
          self._lastReportDateSavedSearch = new Date(rd.authoredAt);
        }
        self._lastReportDateSavedSearch = self._lastReportDateSavedSearch > new Date(rd.authoredAt) ? self._lastReportDateSavedSearch: new Date(rd.authoredAt);
        self.emit('report', rd);
        return ++emitted < options.maxCount;
      });
      self.savedSearchFetchEnabled = false;
      callback(null, null, self._lastReportDateSavedSearch);
    });
  }
};

// Abstract method to be implemented by child classes to do actual fetching
ContentService.prototype._doFetch = function(options, callback) {
  throw new Error('Not yet implemented');
};

module.exports = ContentService;
