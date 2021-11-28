// Represents a child process (e.g. API, fetching) for the purpose of interprocess communication.

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var EventProxy = require('./event-proxy');
var _ = require('underscore');

// Avoid orphan processes by exiting when parent dies
process.on('disconnect', function() { process.exit(1); });

var ChildProcess = function() {
  this.eventProxies = [];
  var self = this;
  // Listen to message from parent process
  process.on('message', function(message) {
    // Reply to 'ping' with 'pong' for testing purposes
    if (message === 'ping') self.sendToParent('pong');
    else if (message.event === 'register') self.registerOutgoingEmitter(message);
    else self.forwardMessage(message);
  });
};

util.inherits(ChildProcess, EventEmitter);

// Wrapper around `process.send()`
// data - This value represents the argument passed to an event, and it has to be an object
ChildProcess.prototype.sendToParent = function(event, data) {
  data = data || {};
  if (typeof data === 'object') {
    data.event = event;
  } else {
    throw new Error('Argument passed to emitted events has to be an object');
  }
  // `send()` is only available for forked processes. We default to using
  // `emit()` when running as a single process.
  if (typeof process.send === 'function') process.send(data);
  else process.emit(data.event, data);
};

// Forward message from parent to the appropriate listeners
ChildProcess.prototype.forwardMessage = function(message) {
  this.eventProxies.forEach(function(eventProxy) {
    // Determine if event proxy has the correct event type registered
    if (_.contains(eventProxy.events, message.event)) {
      eventProxy.emit(message.event, message);
    }
  });
};

// Create an event proxy and register it with the parent process manager
ChildProcess.prototype.setupEventProxy = function(options) {
  var self = this;
  var eventProxy = new EventProxy(options);
  this.eventProxies.push(eventProxy);
  eventProxy.on('newListener', function(event, listener) {
    // Add new event to event proxy
    eventProxy.events.push(event);
    // Send to parent to register new route
    self.sendToParent('register', eventProxy.toJSON());
  });
  return eventProxy;
};

// Register an outgoing event emitter for child-to-parent messaging
ChildProcess.prototype.registerOutgoingEmitter = function(options) {
  var self = this;
  // Load module to listen to, with an optional emitter component
  var emitter = require('..' + options.emitter);
  if (options.subclass) emitter = emitter[options.subclass];
  // Listen to registered event
  if (!_.contains(_.keys(emitter._events), options.registeredEvent)) {
    // Events emitted by the app can have up to 1 argument (data)
    emitter.on(options.registeredEvent, function(data, other) {
      if (other) throw new Error('Events can only have one argument');
      // Send to parent so that it can be forwarded to the appropriate module
      self.sendToParent(options.registeredEvent, data);
    });
  }
};

// Initialize a single ChildProcess per forked module
module.exports = new ChildProcess();
