process.title = 'aggie';
var processManager = require('./lib/process-manager');
var logger = require('./lib/master-logger');

// handle uncaught exceptions
process.on('uncaughtException', function (err) {
  logger.log('error', err.message);
  logger.log('debug', err.stack);
});

// Begins the three main app processes API, fetching, and analytics.
// See Readme files in lib subdirectores for more on each.
processManager.fork('/lib/api');
processManager.fork('/lib/fetching');
processManager.fork('/lib/analytics');

module.exports = processManager;
