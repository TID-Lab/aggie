process.title = 'aggie';
require('dotenv').config(); // Get Environment Variables from .env
const processManager = require('./backend/process-manager');
const initLogger = require('./backend/master-logger').init;
const log = require('./backend/master-logger').log;

// fork child at specific module path
function _fork(modulePath) {
  const child = processManager.fork(modulePath);
  initLogger(child.moduleName);
  log(child.moduleName, 'debug', 'Aggie started');
}

// initialize master logger
const masterLoggerName = 'master';
initLogger(masterLoggerName);
log(masterLoggerName, 'debug', 'Aggie started');

// handle uncaught exceptions
process.on('uncaughtException', function(err) {
  log(masterLoggerName, 'error', err.message);
  log(masterLoggerName, 'debug', err.stack);
});

// Begins the three main backend processes API, fetching, and analytics.
// See Readme files in backend subdirectores for more on each.
_fork('/backend/api');
_fork('/backend/fetching');
_fork('/backend/analytics');

module.exports = processManager;
