process.title = 'aggie';

var processManager = require('./lib/process-manager');
var initLogger = require('./lib/master-logger').init;
var log = require('./lib/master-logger').log;

// fork child at specific module path
function _fork(modulePath) {
  var child = processManager.fork(modulePath);
  initLogger(child.moduleName);
  log(child.moduleName, 'debug', 'Aggie started');
}

// initialize master logger
var masterLoggerName = 'master';
initLogger(masterLoggerName);
log(masterLoggerName, 'debug', 'Aggie started');

// handle uncaught exceptions
process.on('uncaughtException', function(err) {
  log(masterLoggerName, 'error', err.message);
  log(masterLoggerName, 'debug', err.stack);
});

// Begins the three main app processes API, fetching, and analytics.
// See Readme files in lib subdirectores for more on each.
_fork('/lib/api');
_fork('/lib/fetching');
_fork('/lib/analytics');

module.exports = processManager;
