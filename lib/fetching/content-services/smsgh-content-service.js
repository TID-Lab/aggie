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
  this.sourceCounter = 0;
  var self = this;

  var getKeyword = function(req) {
    return ('sms_ghana:' + req.query.keyword);
  };

  this._app.get('/smsghana', function(req, res) {

    var _params = req.query;
    res.send(200);
    var reportData = self._parse(_params);
    self.emit(getKeyword(req), reportData);

  });

  this.port = port || 1111;
};


util.inherits(SMSGhContentService, ContentService);

// May have concurrency issues.
SMSGhContentService.prototype.subscribe = function(identifier) {
  if (this._isListening) {
    return 'sms_ghana:' + identifier;
  }
  this._isListening = true;
  server = this._app.listen(this.port);
  return 'sms_ghana:' + identifier;

/*
  if (this.sourceCounter === 0) {
    server = this._app.listen(this.port);
  }
  this.sourceCounter += 1;
  // check for warning or error
  return 'sms_ghana:' + identifier;
*/
};

SMSGhContentService.prototype.unsubscribe = function() {
  // Okay then. Thank you for letting us know.
  return;

  /*
  this.sourceCounter -= 1;

  if (this.sourceCounter === 0) {
    server.close();
  }

  if (this.sourceCounter < 0) {
    console.log("Entered source_counter < 0");
    this.sourceCounter = 0;
    return;
  }
  */

};

SMSGhContentService.prototype._parse = function(query) {
  var returnObject = {};
  returnObject.authoredAt = new Date(query.date);
  returnObject.fetchedAt = new Date();
  returnObject.url = ''; // since url is part of the schema
  if (query.hasOwnProperty('from')) {
    returnObject.author = query.from;
  } else {
    returnObject.author = 'anonymous';
    console.log('Request did not have an author');
  }

  if (query.hasOwnProperty('keyword')) {
    returnObject.keyword = query.keyword.toLowerCase(); // this may need to change
  } else {
    console.log('This report will not be generated since there is no keyword');
    console.log('Request does not have a keyword');
  }

  if (query.hasOwnProperty('fulltext')) {
    returnObject.content = query.fulltext.toLowerCase(); //This may need to change
  } else {
    returnObject.content = '';
    console.log('Request does not have content');
  }

  return returnObject;
};

module.exports = new SMSGhContentService();
