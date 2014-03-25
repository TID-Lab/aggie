var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Wrapper class for specific content services
var ContentService = function() {
  EventEmitter.call(this);
};

util.inherits(ContentService, EventEmitter);

module.exports = ContentService;
