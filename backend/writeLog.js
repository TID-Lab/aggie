'use strict';

const config = require('./config/secrets');
const logger = require('./logger');
const userLogger = require('./userLogger');

var logFlag = config.get().logger.api.log_user_activity;

const writer = {};

writer.writeGroup = function(req, group, action) {
  if (!logFlag) return;
  var logDetails = {
    userID: req.user._id,
    username: req.user.username,
    action: action,
    actionRef: {
      groupTitle: group.title,
      groupID: group._id,
      referer: req.headers ? req.headers.referer : ''
    }
  };
  if (action === 'editGroup' || action === 'createGroup') {
    logDetails.actionRef.groupInformation = {
      location: group.locationName,
      notes: group.notes,
      assignedTo: group.assignedTo,
      closed: group.closed,
      escalated: group.escalated,
      veracity: group.veracity,
      status: group.status,
      tags: group.tags
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
  if (action === 'flag/unflag/removeFromGroup') {
    logDetails.actionRef.reportFlags = {
      read: report.read,
      linkedToGroup: report._group ? true : false
    };
  }
  if (action === 'addToGroup') {
    logDetails.actionRef.groupID = report._group;
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
