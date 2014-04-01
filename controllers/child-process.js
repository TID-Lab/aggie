var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ChildProcess = function() {
  var self = this;
  // Listen to message from parent process
  process.on('message', function(event, data) {
    // Reply back with 'echo' event for testing purposes
    if (event === 'echo') process.send(event);
    else self.emit(event, data);
  });
};

util.inherits(ChildProcess, EventEmitter);

// Wrapper around `process.send()`
ChildProcess.prototype.sendToParent = function(message, data) {
  process.send(message, data);
};

// Register an event proxy with the parent process manager
ChildProcess.prototype.createEventProxy = function(options) {
  this.sendToParent('register', options);
};

// Initialize child process as a singleton
module.exports = new ChildProcess();
