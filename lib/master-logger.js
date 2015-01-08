// Setup winston logger and provide functionality for master process to log

var winston = require('winston');
require('winston-amazon-ses').SES;
var config = require('../config/secrets').get();
var moment = require('moment');

/** Log custom timestamp */
var loggerTimestamp = function() {
  return moment().zone('+0000').format('ddd, D MMM YYYY HH:mm:ss z');
};

// configure file transport
function _configureFileTransport() {
  if (config.logger.file.timestamp) config.logger.file.timestamp = loggerTimestamp;
  
  winston.add(winston.transports.File, config.logger.file);
}

// configure file transport
function _configureSESTransport(transports) {
  winston.add(winston.transports.SES, config.logger.SES);
}

// configure various transports
_configureFileTransport();
_configureSESTransport();

// set levels
winston.setLevels(winston.config.npm.levels);

module.exports = winston;
