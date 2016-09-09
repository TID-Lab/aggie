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
  var self = this;

  var getKeyword = function (req) {
    return ("sms_ghana:"+req.query.keyword);
  }

  this._app.get('/smsghana', function(req, res) {

    var _params = req.query;
    res.send(200);
    var reportData = self._parse(_params);
    self.emit(getKeyword(req), reportData);

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
  // check for warning or error
  return 'sms_ghana:' + identifier;

};

SMSGhContentService.prototype.unsubscribe = function() {
  this.source_counter -= 1;
  if (this.source_counter === 0) {
    server.close();
  }

  if (this.source_counter < 0) {
    console.log("Entered this funciton");
    // Should throw an error, somehow.
  }
};

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
