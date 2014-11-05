// Fetches data for a single source.
// Converts received data to a common schema and emits 'report' event with the converted data.
// See subclasses for implementation.

var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Wrapper class for specific content services
var ContentService = function() {};

util.inherits(ContentService, EventEmitter);

module.exports = ContentService;
