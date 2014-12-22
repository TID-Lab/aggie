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
logger.warn = function(warning) {
  childProcess.sendToParent('log', {level: 'warn', message: warning, metadata: null});
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
  
  if (stacktrace) childProcess.sendToParent('log', {level: 'debug', message: stacktrace, metadata: null});
  
  childProcess.sendToParent('log', {level: 'error', message: message, metadata: null});
};

module.exports = logger;
