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

    var _params = req.query;
    res.send(200);
    var reportData = self._parse(_params);
    self.emit(self.source_identifier, reportData);
  });

  this.port = port || 1111;
};


util.inherits(SMSGhContentService, ContentService);

//May have concurrency issues. Check and fix with semaphores if necessary
SMSGhContentService.prototype.subscribe = function(identifier) {
  if (this.source_counter === 0) {
    server = this._app.listen(this.port);
  }
  this.source_counter += 1;
  this.source_identifier = identifier;
  return identifier;

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
