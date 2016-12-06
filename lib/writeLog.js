'use strict';

var config = require('../config/secrets');
var logger = require('./logger');
var userLogger = require('./userLogger');

var logFlag = config.get().logger.api.log_user_activity;

var writer = {};

writer.writeIncident = function(req, incident, action) {
  if (!logFlag) return;
  var logDetails = {
    userID: req.user._id,
    username: req.user.username,
    action: action,
    actionRef: {
      incidentTitle: incident.title,
      incidentID: incident._id,
      referer: req.headers ? req.headers.referer : ''
    }
  };
  if (action === 'editIncident' || action === 'createIncident') {
    logDetails.actionRef.incidentInformation = {
      location: incident.locationName,
      notes: incident.notes,
      assignedTo: incident.assignedTo,
      closed: incident.closed,
      escalated: incident.escalated,
      veracity: incident.veracity,
      status: incident.status,
      tags: incident.tags
    };
  }
  userLogger.writeToCollection(logDetails, function(err) {
    if (err) logger.error(err);
  });
};

writer.writeSource = function(req, source, action) {
  if (!logFlag) return;
  var logDetails = {
    userID: req.user._id,
    username: req.user.username,
    action: action,
    actionRef: {
      sourceNickname: source.nickname,
      sourceID: source._id,
      sourceURI: source.keywords ? source.keywords : source.url,
      sourceMedia: source.media
    }
  };
  if (action === 'enable/disable/editSource') {
    logDetails.actionRef.sourceFlags = {
      enabled: source.enabled
    };
  }
  userLogger.writeToCollection(logDetails, function(err) {
    if (err) logger.error(err);
  });
};

writer.writeReport = function(req, report, action, query) {
  if (!logFlag) return;
  var logDetails = {
    userID: req.user._id,
    username: req.user.username,
    action: action
  };
  if (action !== 'deleteAllReports' && action !== 'filter') {
    logDetails.actionRef = {
      reportContent: report.content,
      reporttID: report._id,
      reportMedia: report._media,
      referer: req.headers ? req.headers.referer : ''
    };
  } else logDetails.actionRef = {};
  if (action === 'flag/unflag/removeFromIncident') {
    logDetails.actionRef.reportFlags = {
      flagged: report.flagged,
      read: report.read,
      linkedToIncident: report._incident ? true : false
    };
  }
  if (action === 'addToIncident') {
    logDetails.actionRef.incidentID = report._incident;
  }
  if (query) {
    logDetails.actionRef = query;
  }
  userLogger.writeToCollection(logDetails, function(err) {
    if (err) logger.error(err);
  });
};

writer.writeBatch = function(req, action, reports) {
  if (!logFlag) return;
  var logDetails = {
    userID: req.user._id,
    username: req.user.username,
    action: action,
    actionRef: {}
  };
  if (reports) {
    var reportContents = [];
    reports.forEach(function(report) {
      reportContents.push({
        id: report._id,
        media: report._media,
        nickname: report._sourceNicknames
      });
    });
    logDetails.actionRef.reports = reportContents;
  }
  userLogger.writeToCollection(logDetails, function(err) {
    if (err) logger.error(err);
  });
};

writer.writeTrend = function(req, action) {
  if (!logFlag) return;
  var logDetails = {
    userID: req.user._id,
    username: req.user.username,
    action: action,
    actionRef: {}
  };
  userLogger.writeToCollection(logDetails, function(err) {
    if (err) logger.error(err);
  });
};

module.exports = writer;
