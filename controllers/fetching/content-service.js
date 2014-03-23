var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Wrapper class for specific content services
var ContentService = function(options) {
  this.source = this.source || options.source;
  this.filter = this.filter || options.filter;
  EventEmitter.call(this);
};

util.inherits(ContentService, EventEmitter);

module.exports = ContentService;
