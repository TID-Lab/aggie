// Fetches data for a single source.
// Converts received data to a common schema and emits 'report' event with the converted data.
// See subclasses for implementation.

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');

// Wrapper class for specific content services
var ContentService = function() {
  this._maxCount = -1;
  this._reports = [];
};

util.inherits(ContentService, EventEmitter);

ContentService.prototype.fetch = function(options, callback) {
  if (options && typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  options = options || {};
  callback = callback || function() {};
  this._maxCount = options.maxCount || -1;
  this._reports = [];
  
  this._doFetch(options, callback);
};

// Abstract method to be implemented by child classes to do actual fetching
ContentService.prototype._doFetch = function(options, callback) {
  throw new Error('Not yet implemented');
};

// Method called by child classes when a report is found
// returns true if the report is accepted, false if not
ContentService.prototype._addReport = function(reportData) {
  // see if we already have enough reports
  var count = this._reports.length;
  if (this._maxCount > 0 && count >= this._maxCount) return false;
  
  this._reports.push(reportData);
  return true;
};

// Method called by child classes to see if more reports can be added
ContentService.prototype._canAddReports = function(count) {
  if (count <= 0) return true;
  else if (this._maxCount > 0 && (count + this._reports.length) > this._maxCount) return false;
  else return true;
};

// Method called by child classes when fetching is finished
ContentService.prototype._fetchingFinished = function() {
  var self = this;
  
  _.sortBy(this._reports, 'authoredAt').forEach(function(report_data) {
    self.emit('report', report_data);
  });
};


module.exports = ContentService;
