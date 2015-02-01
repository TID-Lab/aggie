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
  this.sourceType = options.sourceType;
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

  var query = _.pick(this, ['keywords', 'status', 'after', 'before', 'sourceId', 'sourceType', 'incidentId', 'author']);

  if (query.keywords) {
    // Make all keywords lowercase, then sort them alphabetically
    query.keywords = query.keywords.replace(/(,|\s)+/g, ' ').split(' ').map(function(w) {
      return w.toLowerCase();
    }).sort().join(' ');
  }

  return query;
};

ReportQuery.prototype._parseStatus = function(status) {
  switch(status) {
    case 'flagged':
      this.flagged = true;
      break;
    case 'unflagged':
      this.unflagged = true;
      break;
    case 'read':
      this.read = true;
      break;
    case 'unread':
      this.read = false;
      break;
    case 'read_unflagged':
      this.read = true;
      this.flagged = false;
      break;
  }
}

ReportQuery.prototype._parseIncidentId = function(incidentId) {
  if (incidentId == 'a') {
    this.incidentId = { $ne: null };
  }
  else if (incidentId == 'n') {
    this.incidentId = null;
  }
  else {
    this.incidentId = incidentId;
  }
}

module.exports = ReportQuery;
