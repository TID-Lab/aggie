var EventEmitter = require('events').EventEmitter;
var util = require('util');

var EventProxy = function(options) {
  this.emitter = options.emitter;
  this.emitterModule = options.emitterModule;
  this.subclass = options.subclass;
  this.events = [];
};

util.inherits(EventProxy, EventEmitter);

// Return JSON data specific to Event Proxy
EventProxy.prototype.toJSON = function() {
  return {
    emitter: this.emitter,
    emitterModule: this.emitterModule,
    subclass: this.subclass,
    events: this.events
  };
};

module.exports = EventProxy;
