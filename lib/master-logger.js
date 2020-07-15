// Setup winston logger and provide functionality for master process to log

var config = require('../config/secrets').get();
var moment = require('moment');
var _ = require('underscore');

var winston = require('winston');
var SESTransport = require('./ses-transport')
var SlackTransport = require("winston-slack-webhook-transport");

/** Log custom timestamp */
var loggerTimestamp = function() {
  return moment.utc().format('ddd, D MMM YYYY HH:mm:ss z');
};

// configure Winston transports
function _configureTransports(name) {
  var logger = config.logger;
  if (logger.file.timestamp) logger.file.timestamp = loggerTimestamp;
  logger.file.filename = logger[name].filename;

  return [
    !logger.SES.disabled ? null : new SESTransport(logger.SES),
    !logger.Slack.disabled ? null : new SlackTransport(logger.Slack),
    !logger.file.disabled ? null : new winston.transports.File(logger.file)
  ].filter(Boolean);
}

// configure specified logger
function _configureLogger(name) {
  return winston.createLogger({
    levels: winston.config.npm.levels,
    transports: _configureTransports(name),
    exitOnError: false
  });
}

// hash of various loggers, one for each process
var _loggers = {};

_loggers.master = _configureLogger('master');

// initialize specific logger
// called by app.js
module.exports.init = function(loggerName) {
  _loggers[loggerName] = _configureLogger(loggerName);
};

// log to specific logger
module.exports.log = function(loggerName, level, message, metadata) {
  var logger = _loggers[loggerName];
  if (!logger) return;

  if (metadata === undefined) metadata = null;

  logger.log(level, message, metadata);
};
