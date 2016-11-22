// Setup winston logger and provide functionality for master process to log

var config = require('../config/secrets').get();
var moment = require('moment');
var _ = require('underscore');

var winston = require('winston');
require('winston-amazon-ses').SES;
require('winston-slack-transport').Slack;
// set levels
winston.setLevels(winston.config.npm.levels);

/** Log custom timestamp */
var loggerTimestamp = function() {
  return moment().zone('+0000').format('ddd, D MMM YYYY HH:mm:ss z');
};

// configure specified logger
function _configureLogger(name) {
  if (config.logger.file.timestamp) config.logger.file.timestamp = loggerTimestamp;
  config.logger.file.filename = config.logger[name].filename;

  var logger = new (winston.Logger)({
    transports: [
      new winston.transports.File(config.logger.file),
      new winston.transports.Slack(config.logger.Slack),
      new winston.transports.SES(config.logger.SES)
    ]
  });

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
