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
      self.messageHandler(data, child);
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
ProcessManager.prototype.messageHandler = function(data, child) {
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
  options.listenerModule = child.moduleName;
  this.routes.push(_.omit(options, 'event'));
  var emitter = this.getChild(options.emitterModule);
  if (emitter && options.event === 'register') emitter.send(options);
};

// Forward message from a child process to another child process
ProcessManager.prototype.forwardMessage = function(data, emitterChild) {
  var self = this;
  var routes = _.where(this.routes, {emitterModule: emitterChild.moduleName});
  routes.forEach(function(route) {
    if (_.contains(route.events, data.event)) {
      var listeningChild = self.getChild(route.listenerModule);
      // When forwarding a 'pong' response, send 'ping' to the recipient to get
      // 'pong' back and complete the forward ping-pong cycle between two modules
      if (data.event === 'pong' && listeningChild.moduleName !== emitterChild.moduleName) data = 'ping';
      if (listeningChild) listeningChild.send(data);
    }
  });
  // Emit same event in the parent process
  emitterChild.emit(data.event, data);
};

module.exports = new ProcessManager();
