var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ProcessManager = function() {};

util.inherits(ProcessManager, EventEmitter);

module.exports = new ProcessManager();
