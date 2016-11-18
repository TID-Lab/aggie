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
      sourceURI: source.keywords ? source.keywords : source.url
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

writer.writeReport = function(req, report, action) {
  if (!logFlag) return;
  var logDetails = {
    userID: req.user._id,
    username: req.user.username,
    action: action
  };
  if (action !== 'deleteAllReports') {
    logDetails.actionRef = {
      reportContent: report.content,
      reporttID: report._id,
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
  userLogger.writeToCollection(logDetails, function(err) {
    if (err) logger.error(err);
  });
};

module.exports = writer;
