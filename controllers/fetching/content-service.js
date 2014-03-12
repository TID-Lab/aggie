var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Wrapper class for specific content services
var ContentService = function(options) {
  this.type = options.type || 'dummy';
  this.filter = options.filter;
  EventEmitter.call(this);
  var SubContentService = require('./content-services/' + this.type + '-content-service');
  return new SubContentService(options);
};

util.inherits(ContentService, EventEmitter);

module.exports = ContentService;
