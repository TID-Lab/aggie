var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');

var ChildProcess = function() {
  var self = this;
  // Listen to message from parent process
  process.on('message', function(message) {
    // Reply to 'ping' with 'pong' for testing purposes
    if (message === 'ping') self.sendToParent('pong');
    else if (message.event === 'register') self.registerEventEmitter(message);
    else self.emit(message.event, message);
  });
};

util.inherits(ChildProcess, EventEmitter);

// Wrapper around `process.send()`
ChildProcess.prototype.sendToParent = function(event, data) {
  data = data || {};
  data.event = event;
  if (typeof process.send === 'function') process.send(data);
  else process.emit(data.event, data);
};

// Register an event proxy with the parent process manager
ChildProcess.prototype.createEventProxy = function(options) {
  var eventEmitter = new EventEmitter();
  eventEmitter.emitter = options.emitter;
  eventEmitter.emitterModule = options.emitterModule;
  return eventEmitter;
};

// Register an event listener for proces-to-process communication
ChildProcess.prototype.registerEventListeners = function(eventProxy) {
  if (!eventProxy._events) return;
  var data = {};
  // Determine all listened-to events
  data.events = _.keys(eventProxy._events);
  data.emitter = eventProxy.emitter;
  data.emitterModule = eventProxy.emitterModule;
  this.sendToParent('register', data);
};

// Register an event emitter for process-to-process communication
ChildProcess.prototype.registerEventEmitter = function(options) {
  var self = this;
  var emitter = require('..' + options.emitter);
  // Listen to all listened-to events
  options.events.forEach(function(event) {
    if (emitter.listeners(event).length === 0) {
      emitter.on(event, function(data) {
        // Send to parent so that it can be forwarded to the appropriate module
        self.sendToParent(event, data);
      });
    }
  });
};

// Initialize a single ChildProcess per forked module
module.exports = new ChildProcess();
