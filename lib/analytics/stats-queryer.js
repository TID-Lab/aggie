var async = require('async');
var Report = require('../../models/report');
var Incident = require('../../models/incident');
var _ = require('underscore');
var ONE_MINUTE = 60 * 1000;

var StatsQueryer = function() {
  this.handlers = {
    all: this._countAll,
    incidents: this._countAllIncidents,
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
  Report.count(query, callback);
};

StatsQueryer.prototype._countIncidents = function(query, callback) {
  query || (query = {});
  Incident.count(query, callback);
};

StatsQueryer.prototype._countAllReports = function(callback) {
  async.parallel({
    totalReports: this._countReports,
    totalReportsUnread: this._countReports.bind(this, { read: false }),
    totalReportsPerMinute: this._countReports.bind(this, { storedAt: { $gte: minuteAgo() } }),
    totalReportsFlagged: this._countReports.bind(this, { flagged: true })
  }, callback);
};

StatsQueryer.prototype._countReportsPerMinute = function(callback) {
  return this._countReports({ storedAt: { $gte: minuteAgo() } }, function(err, results) {
    if (err) return callback(err);
    callback(err, { totalReportsPerMinute: results });
  });
};


StatsQueryer.prototype._countAllIncidents = function(callback) {
  async.parallel({
    totalIncidents: this._countIncidents,
    totalEscalatedIncidents: this._countIncidents.bind(this, { escalated: true })
  }, callback);
};

StatsQueryer.prototype._countAll = function(callback) {
  var self = this;
  async.parallel({
    reports: this._countAllReports.bind(this),
    incidents: this._countAllIncidents.bind(this)
  }, function(err, results) {
    if (err) return callback(err);

    _.extend(results.reports, results.incidents);
    callback(null, results.reports);
  });
};

// helpers

function minuteAgo() {
  var now = new Date();
  return new Date(now.getTime() - ONE_MINUTE);
}

module.exports = StatsQueryer;
