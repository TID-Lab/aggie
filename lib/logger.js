// Logger for the child processes

var childProcess = require('./child-process');
var logger = {};

// Log debug message, or an object, or both
logger.debug = function(message, metadata) {
  if (typeof message === 'object') {
    metadata = message;
    message = '';
  }

  if (metadata === undefined) metadata = null;

  childProcess.sendToParent('log', { level: 'debug', message: message, metadata: metadata });
};

// Log information message
logger.info = function(information, metadata) {
  if (metadata === undefined) metadata = null;

  childProcess.sendToParent('log', { level: 'info', message: information, metadata: metadata });
};

// Log warning message
logger.warning = function(warning, metadata) {
  if (metadata === undefined) metadata = null;

  var message = warning instanceof Error ? warning.message : warning;
  childProcess.sendToParent('log', { level: 'warn', message: message, metadata: metadata });
};

// Log error message
logger.error = function(error, metadata) {
  var message = null, stacktrace = null;
  if (typeof error === 'object') {
    message = error.message;
    stacktrace = error.stack;
  } else {
    message = error;
  }

  if (metadata === undefined) metadata = null;

  if (stacktrace) childProcess.sendToParent('log', { level: 'error', message: stacktrace, metadata: metadata });
  else childProcess.sendToParent('log', { level: 'error', message: message, metadata: metadata });
};

module.exports = logger;
