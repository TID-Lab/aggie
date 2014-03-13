var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Wrapper class for specific content services
var ContentService = function(options) {
  this.source = options.source || 'dummy';
  this.filter = options.filter;
  EventEmitter.call(this);
  var SubContentService = require('./content-services/' + this.source + '-content-service');
  return new SubContentService(options);
};

util.inherits(ContentService, EventEmitter);

module.exports = ContentService;
