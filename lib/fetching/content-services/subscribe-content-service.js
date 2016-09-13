'use strict';

var ContentService = require('../content-service');
var util = require('util');

var SubscribeContentService = function(port) {
  // this.config = _.clone(config.get().subscribe);
  this.fetchType = 'subscribe';
  this._isListening = false;
  this.source_counter = 0;
  var self = this;
};

util.inherits(SubscribeContentService, ContentService);

SubscribeContentService.prototype.subscribe = function(identifier) {
  if (this.source_counter === 0) {
  	this._isListening = true;
  }
  this.source_counter += 1;
  // check for warning or error
  return 'subscribe:' + identifier;

};

SubscribeContentService.prototype.unsubscribe = function() {
  this.source_counter -= 1;
  if (this.source_counter === 0) {
    this._isListening = false;
  }

  if (this.source_counter < 0) {
    console.log("Entered this funciton");
    // Should throw an error, somehow.
  }
};

SubscribeContentService.prototype._parse = function(query) {
  return {
    authoredAt: new Date(query.date),
    fetchedAt: new Date(),
    author: query.from,
    // campaign: query.campaign,
    // keyword: query.keyword
    // If required, and necessary accommodations are made on the front end
    content: query.fulltext
  };
};

module.exports = SMSGhContentService;