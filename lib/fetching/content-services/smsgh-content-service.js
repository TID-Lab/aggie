'use strict';

// var http = require('http');
// var url = require('url');
var express = require('express');
var ContentService = require('../content-service');
// var config = require('../../../config/secrets');
var util = require('util');
// var _ = require('underscore');

var _app = express();
var server;

var SMSGhContentService = function() {
  // this.config = _.clone(config.get().smsgh);
  // Above to be uncommented only if SMSGh is to have some config settings.
  this.fetchType = 'push';
  this._isListening = false;
};

// '/smsghana' below can be changed based on requirement. ('/' may be fine).
_app.get('/smsghana', function(req, res) {
  var _params = req.query;
  res.sendStatus(200).end();
  var reportData = SMSGhContentService._parse(_params);
  // Emit the report
  SMSGhContentService.emit('report', reportData);
});

util.inherits(SMSGhContentService, ContentService);

SMSGhContentService.prototype.start = function() {
  if (this._isListening) return;
  this._isListening = true;
  // listen on the server
  server = _app.listen(1111);
};

SMSGhContentService.prototype.stop = function() {
  this._isListening = false;
  // Stop the server
  server.close();
};

SMSGhContentService.prototype._parse = function(query) {
  return {
    AuthoredAt: new Date(query.Date),
    fetchedAt: new Date(),
    author: query.From,
    // campaign: query.Campaign,
    // If required, and necessary accommodations are made on the front end
    content: query.Fulltext
  };
};



module.exports = SMSGhContentService;
