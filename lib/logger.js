// Logger for the child processes

var childProcess = require('./child-process');

var logger = function() {};

// Log debug message, or an object, or both
logger.debug = function(message, metadata) {
  if (typeof message === 'object') {
    metadata = message;
    message = '';
  }
  childProcess.sendToParent('log', {level: 'debug', message: message, metadata: metadata});
};

// Log information message
logger.info = function(information) {
  childProcess.sendToParent('log', {level: 'info', message: information, metadata: null});
};

// Log warning message
logger.warning = function(warning) {
  var message = warning instanceof Error ? warning.message : warning;
  childProcess.sendToParent('log', {level: 'warn', message: message, metadata: null});
};

// Log error message
logger.error = function(error) {
  var message = null, stacktrace = null;
  if (typeof error === 'object') {
    message = error.message;
    stacktrace = error.stack;
  }
  else {
    message = error;
  }
  
  childProcess.sendToParent('log', {level: 'error', message: message, metadata: null});
  if (stacktrace) childProcess.sendToParent('log', {level: 'debug', message: stacktrace, metadata: null});
};

module.exports = logger;
