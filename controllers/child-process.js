var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ChildProcess = function() {
  var self = this;
  // Listen to message from parent process
  process.on('message', function(message, data) {
    if (message === 'echo') process.send(message);
    else self.emit(message, data);
  });
};

util.inherits(ChildProcess, EventEmitter);

// Wrapper around `process.send()`
ChildProcess.prototype.send = function(message) {
  if (message !== 'message') {
    process.send(message);
  }
};

module.exports = new ChildProcess();
