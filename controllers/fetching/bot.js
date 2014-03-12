var ContentService = require('./content-service');
var Report = require('../../models/report');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Bot = function(options) {
  options = options || {};
  options.type = options.type || 'dummy';
  options.filter = options.filter || '';
  this.contentService = new ContentService(options);
  EventEmitter.call(this);
};

util.inherits(Bot, EventEmitter);

module.exports = Bot;
