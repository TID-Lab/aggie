var path = require('path');
var _ = require('underscore');
// We only need `fork()` to create new processes
var fork = require('child_process').fork;

var ProcessManager = function() {
  this.children = [];
  this.routes = [];
};

// Fork a module and add it to the children list
// @modulePath Path of the module relative to the root directory
ProcessManager.prototype.fork = function(modulePath) {
  var self = this;
  modulePath = require.resolve(path.join(process.env.PWD, modulePath));
  moduleName = path.basename(modulePath, '.js');
  var child = this.getChild(moduleName);
  if (!child) {
    child = fork(modulePath);
    // Add module metadata
    child.modulePath = modulePath;
    child.moduleName = moduleName;
    // Listen to messages from child
    child.on('message', function(data) {
      self.handleMessage(data, child);
    });
    this.children.push(child);
  }
  return child;
};

// Get child process from module name
ProcessManager.prototype.getChild = function(moduleName) {
  return _.findWhere(this.children, {moduleName: moduleName});
};

// Handle different types of messages
ProcessManager.prototype.handleMessage = function(data, child) {
  switch (data.event) {
    case 'register':
      this.registerRoute(data, child);
      break;
    default:
      this.forwardMessage(data, child);
      break;
  }
};

// Add route to map
ProcessManager.prototype.registerRoute = function(options, child) {
  var self = this;
  var emitter = this.getChild(options.emitterModule);
  options.listenerModule = child.moduleName;
  options.events.forEach(function(event) {
    var route = _.extend(_.omit(options, 'events'), {registeredEvent: event});
    // Avoid duplicate routes
    if (!_.findWhere(self.routes, route)) {
      self.routes.push(route);
      // Forward route information to outgoing emitter
      if (emitter && route.event === 'register') emitter.send(route);
    }
  });
};

// Forward message from a child process to another child process
ProcessManager.prototype.forwardMessage = function(data, emitterChild) {
  var self = this;
  var routes = _.where(this.routes, {emitterModule: emitterChild.moduleName, registeredEvent: data.event});
  routes.forEach(function(route) {
    var listeningChild = self.getChild(route.listenerModule);
    // When forwarding a 'pong' response, send 'ping' to the recipient to get
    // 'pong' back and complete the forward ping-pong cycle between two modules
    if (data.event === 'pong' && listeningChild.moduleName !== emitterChild.moduleName) data = 'ping';
    if (listeningChild) listeningChild.send(data);
  });
  // Emit same event in the parent process. This is used for within-process
  // communication in case we are running in a single process.
  emitterChild.emit(data.event, data);
};

module.exports = new ProcessManager();
