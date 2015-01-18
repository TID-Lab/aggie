var async = require('async');
var Report = require('../../models/report');
var Incident = require('../../models/incident');
var _ = require('underscore');

var StatsQueryer = function() {
  this.stats = {
    totalReports: 0,
    totalReportsUnread: 0,
    totalReportsFlagged: 0,
    totalReportsPerMinute: 0,
    totalIncidents: 0,
    totalEscalatedIncidents: 0
  };

  this.handlers = {
    all: this._countAll,
    incidents: this._countAllIncidents,
    reports: this._countAllReports
  };
}

StatsQueryer.prototype.count = function(type, callback) {
  type || (type = 'all');

  var handler = this.handlers[type];
  var self = this;

  if (!handler) return callback(new Error('Handler not found'));

  handler.call(this, function(err, results) {    
    _.extend(self.stats, results);
    callback(null, self.stats);
  });
}

StatsQueryer.prototype._countReports = function(query, callback) {
  query || (query = {}); 
  Report.count(query, function(err, count) {
    if (err) return callback(err);
    callback(null, count);
  });
}

StatsQueryer.prototype._countIncidents = function(query, callback) {
  query || (query = {});
  Incident.count(query, function(err, count) {
    if (err) return callback(err);
    callback(null, count);
  });
}

StatsQueryer.prototype._countAllReports = function(callback) {
  async.parallel({
    totalReports: this._countReports,
    totalReportsUnread: this._countReports.bind(this, {read: false}),
    totalReportsFlagged: this._countReports.bind(this, {flagged: true}),
  }, callback);
}

StatsQueryer.prototype._countAllIncidents = function(callback) {
  async.parallel({
    totalIncidents: this._countIncidents,
    totalEscalatedIncidents: this._countIncidents.bind(this, {escalated: true})
  }, callback);
}

StatsQueryer.prototype._countAll = function(callback) {
  var self = this;
  async.parallel({
    reports: this._countAllReports.bind(this),
    incidents: this._countAllIncidents.bind(this),
  }, function(err, results) {
    _.extend(results.reports, results.incidents);
    callback(null, results.reports);
  });
}

module.exports = StatsQueryer;
