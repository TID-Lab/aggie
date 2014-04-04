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
    var child = fork(modulePath);
    // Add module metadata
    child.modulePath = modulePath;
    child.moduleName = moduleName;
    // Listen to messages from child
    child.on('message', function(message, data) {
      self.messageHandler(message, data, child);
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
ProcessManager.prototype.messageHandler = function(message, data, child) {
  switch (message) {
    case 'register':
      data.child = child;
      this.registerRoute(data);
      break;
    default:
      this.forwardMessage(message, child);
      break;
  }
};

// Add route to map
ProcessManager.prototype.registerRoute = function(options) {
  this.routes.push(options);
};

// Forward message from a child process to another child process
ProcessManager.prototype.forwardMessage = function(message, fromChild) {
  var route = _.findWhere(this.routes, {moduleName: fromChild.moduleName});
  var toChild = this.getChild(route.moduleName);
  toChild.send(message);
};

module.exports = new ProcessManager();
