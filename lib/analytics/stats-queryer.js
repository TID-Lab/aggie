var async = require('async');
var Report = require('../../models/report');
var Group = require('../../models/group');
var _ = require('underscore');
var ONE_MINUTE = 60 * 1000;

var StatsQueryer = function() {
  this.handlers = {
    all: this._countAll,
    groups: this._countAllGroups,
    reports: this._countAllReports,
    interval: this._countReportsPerMinute
  };
};

StatsQueryer.prototype.count = function(type, callback) {
  type || (type = 'all');

  var handler = this.handlers[type];
  var self = this;

  if (!handler) return callback(new Error('Handler not found'));
  handler.call(this, callback);
};

StatsQueryer.prototype._countReports = function(query, callback) {
  query || (query = {});
  if (!_.isEmpty(query)) {
    Report.countDocuments(query, callback);
  } else {
    Report.estimatedDocumentCount(callback);
  }
};

StatsQueryer.prototype._countGroups = function(query, callback) {
  query || (query = {});
  Group.countDocuments(query, callback);
};

StatsQueryer.prototype._countAllReports = function(callback) {
  async.parallel({
    totalReports: this._countReports.bind(this, {}),
    totalReportsUnread: this._countReports.bind(this, { read: false }),
    totalReportsTagged: this._countReports.bind(this, { hasSMTCTags: true }),
    totalReportsEscalated: this._countReports.bind(this, { escalated: true }),
    totalReportsPerMinute: this._countReports.bind(this, { storedAt: { $gte: minuteAgo() } }),
  }, callback);
};

StatsQueryer.prototype._countReportsPerMinute = function(callback) {
  return this._countReports({ storedAt: { $gte: minuteAgo() } }, function(err, results) {
    if (err) return callback(err);
    callback(err, { totalReportsPerMinute: results });
  });
};


StatsQueryer.prototype._countAllGroups = function(callback) {
  async.parallel({
    totalGroups: this._countGroups,
    totalEscalatedGroups: this._countGroups.bind(this, { escalated: true })
  }, callback);
};

StatsQueryer.prototype._countAll = function(callback) {
  var self = this;
  async.parallel({
    reports: this._countAllReports.bind(this),
    groups: this._countAllGroups.bind(this)
  }, function(err, results) {
    if (err) return callback(err);

    _.extend(results.reports, results.groups);
    callback(null, results.reports);
  });
};

// helpers

function minuteAgo() {
  var now = new Date();
  return new Date(now.getTime() - ONE_MINUTE);
}

module.exports = StatsQueryer;
