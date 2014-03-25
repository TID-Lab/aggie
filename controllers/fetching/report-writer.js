var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ReportWriter = function() {
  EventEmitter.call(this);
};

util.inherits(ReportWriter, EventEmitter);

module.exports = new ReportWriter();
