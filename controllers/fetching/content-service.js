var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Wrapper class for specific content services
var ContentService = function(options) {
  this.source = this.source || options.source;
  this.filter = this.filter || options.filter;
  EventEmitter.call(this);
};

util.inherits(ContentService, EventEmitter);

module.exports = function factory(options) {
  var SubContentService = csType(options.source);
  return new SubContentService(options);
};

module.exports.ContentService = ContentService;

var csType = function(source) {
  return require('./content-services/' + source + '-content-service');
};
