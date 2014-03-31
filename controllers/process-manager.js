var child_process = require('child_process');
var _ = require('underscore');

var ProcessManager = function() {
  this.children = [];
};

ProcessManager.prototype.fork = function(modulePath) {
  var self = this;
  modulePath = require.resolve(modulePath);
  var moduleName = this._parseName(modulePath);
  if (!this.isForked(moduleName)) {
    var child = child_process.fork(modulePath);
    // Add module metadata
    child.modulePath = modulePath;
    child.moduleName = moduleName;
    // Listen to messages from child and broadcast
    child.on('message', function(message) {
      self.broadcast(message, moduleName);
    });
    this.children.push(child);
    return child;
  }
  return this.getChild(moduleName);
};

// Parse module name from resolved path
ProcessManager.prototype._parseName = function(modulePath) {
  return _.last(modulePath.split('/')).split('.')[0];
};

// Determine if a process has been forked
ProcessManager.prototype.isForked = function(moduleName) {
  return _.any(this.children, function(child) {
    return child.moduleName === moduleName;
  });
};

// Get child process from module name
ProcessManager.prototype.getChild = function(moduleName) {
  return _.findWhere(this.children, {moduleName: moduleName});
};

// Send message to all forked processes
ProcessManager.prototype.broadcast = function(message, data, moduleName) {
  if (typeof data === 'string' && moduleName === undefined) {
    moduleName = data;
    data = undefined;
  }
  // Emit in global process scope
  if (this.children.length === 0) {
    process.emit('message', message, data);
  }
  // Send to each child process
  this.children.forEach(function(child) {
    // Avoid echoing
    if (child.moduleName !== moduleName) {
      child.send(message, data);
    }
  });
};

module.exports = new ProcessManager();
