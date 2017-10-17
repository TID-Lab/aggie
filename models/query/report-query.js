// Subclass of Query. Represents a query of the report collection.
'use strict';

var Report = require('../report');
var Query = require('../query');
var util = require('util');
var _ = require('lodash');
var toRegexp = require('../to-regexp');

function ReportQuery(options) {
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
  this.tags = options.tags;
}

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

ReportQuery.prototype.toMongooseFilter = function() {
  var filter = {
    _sources: this.sourceId,
    _media: this.media,
    _incident: this.incidentId,
    read: this.read,
    flagged: this.flagged,
    tags: this.tags
  };

  filter = _.omitBy(filter, _.isNil);

  // Determine inclusive date filters
  if (this.after || this.before) {
    filter.storedAt = {};
    if (this.after) filter.storedAt.$gte = this.after;
    if (this.before) filter.storedAt.$lte = this.before;
  }

  // Return only newer results
  if (this.since) {
    filter.storedAt = filter.storedAt || {};
    filter.storedAt.$gte = this.since;
  }

  // Determine author filter
  if (this.author) {
    filter.author = {};
    filter.author.$in = toRegexp.alli(this.author.trim().split(/\s*,\s*/).sort());
  }
  if (this.tags) {
    filter.tags = { $all: toRegexp.allCaseInsensitive(this.tags) };
  } else delete filter.tags;

  // Search by keyword
  if (this.keywords) {
    filter.$text = { $search: this.keywords };
  }

  return filter;
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
  if (incidentId === 'any') {
    this.incidentId = { $nin: [null, ''] };
  } else if (incidentId === 'none') {
    this.incidentId = { $in: [null, ''] };
  } else {
    this.incidentId = incidentId;
  }
};

module.exports = ReportQuery;
