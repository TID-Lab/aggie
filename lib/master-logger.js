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

// configure specified logger
function _configureLogger(name) {
  if (config.logger.file.timestamp) config.logger.file.timestamp = loggerTimestamp;
  config.logger.file.filename = config.logger[name].filename;

  var logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports: [
      new SESTransport(config.logger.SES),
      new SlackTransport(config.logger.Slack),
      new winston.transports.File(config.logger.file)
    ],
    exitOnError: false
  })

  return logger;
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
