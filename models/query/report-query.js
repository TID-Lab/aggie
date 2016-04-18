// Subclass of Query. Represents a query of the report collection.

var Report = require('../report');
var Query = require('../query');
var util = require('util');
var _ = require('underscore');

var ReportQuery = function(options) {
  options = options || {};
  this.keywords = options.keywords;

  if (options.status) {
    this._parseStatus(options.status);
  }

  this._parseIncidentId(options.incidentId);

  this.after = options.after;
  this.before = options.before;
  this.sourceId = options.sourceId;
  this.media = options.media;
  this.author = options.author;
  this.event = 'reports';
};

_.extend(ReportQuery, Query);
util.inherits(ReportQuery, Query);

ReportQuery.prototype.run = function(callback) {
  Report.queryReports(this, function(err, results) {
    callback(err, results);
  });
};

// Normalize query for comparison
ReportQuery.prototype.normalize = function() {
  return _.pick(this, ['keywords', 'status', 'after', 'before', 'sourceId', 'media', 'incidentId', 'author']);
};

ReportQuery.prototype._parseStatus = function(status) {
  switch (status) {
    case 'Flagged':
      this.flagged = true;
      break;
    case 'Unflagged':
      this.unflagged = true;
      break;
    case 'Read':
      this.read = true;
      break;
    case 'Unread':
      this.read = false;
      break;
    case 'Read & Unflagged':
      this.read = true;
      this.flagged = false;
      break;
  }
};

ReportQuery.prototype._parseIncidentId = function(incidentId) {
  if (incidentId == 'any') {
    this.incidentId = { $nin: [null, ''] };
  } else if (incidentId == 'none') {
    this.incidentId = {$in: [null, '']};
  } else {
    this.incidentId = incidentId;
  }
};

module.exports = ReportQuery;
