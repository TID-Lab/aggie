'use strict';

var express = require('express');
var ContentService = require('../content-service');
// var config = require('../../../config/secrets');
var util = require('util');
// var _ = require('underscore');
var server;

var SMSGhContentService = function(port) {
  // this.config = _.clone(config.get().smsgh);
  // Above to be uncommented only if SMSGh is to have some config settings.
  this.fetchType = 'subscribe';
  this._isListening = false;
  this._app = express();
  this.source_counter = 0;
  this.source_identifier = "";
  var self = this;

  this._app.get('/smsghana', function(req, res) {

    console.log("Request received");
    var _params = req.query;
    console.log("params are "+ _params);
    res.send(200);
    console.log("response sent");
    var reportData = self._parse(_params);
    console.log("response parsed and "+ reportData);
    console.log(self.source_identifier);
    self.emit(self.source_identifier, reportData);
    console.log("emission done");

  });

  this.port = port || 1111;
};


util.inherits(SMSGhContentService, ContentService);

//May have concurrency issues. Check and fix with semaphores if necessary
SMSGhContentService.prototype.subscribe = function(identifier) {
  console.log(this.source_counter);
  if (this.source_counter === 0) {
    server = this._app.listen(this.port);
  }
  this.source_counter += 1;
  // check for warning or error
  this.source_identifier = 'sms_ghana:' + identifier.keyword;
  return this.source_identifier;

};

SMSGhContentService.prototype.unsubscribe = function() {
  this.source_counter -= 1;
  if (this.source_counter === 0) {
    server.close();
  }
};

/*
SMSGhContentService.prototype.start = function() {
  if (this._isListening) return;
  this._isListening = true;
  server = this._app.listen(this.port);
};

SMSGhContentService.prototype.stop = function() {
  this._isListening = false;
  server.close();
};
*/

SMSGhContentService.prototype._parse = function(query) {
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
