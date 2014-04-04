var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ChildProcess = function() {
  var self = this;
  // Listen to message from parent process
  process.on('message', function(message) {
    // Reply to 'ping' with 'pong' for testing purposes
    if (message === 'ping') self.sendToParent('pong');
    else self.emit(message.event, message);
  });
};

util.inherits(ChildProcess, EventEmitter);

// Wrapper around `process.send()`
ChildProcess.prototype.sendToParent = function(event, data) {
  data = data || {};
  data.event = event;
  process.send(data);
};

// Register an event proxy with the parent process manager
ChildProcess.prototype.createEventProxy = function(options) {
  this.sendToParent('register', options);
  return new EventEmitter();
};

// Initialize a single ChildProcess per forked module
module.exports = new ChildProcess();
