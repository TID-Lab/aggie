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
  this.fetchType = 'push';
  this._isListening = false;
  this._app = express();

  var self = this;

  this._app.get('/smsghana', function(req, res) {

    var _params = req.query;
    res.send(200);
    var reportData = self._parse(_params);
    self.emit('report', reportData);
  });

  this.port = port || 1111;
};


util.inherits(SMSGhContentService, ContentService);

SMSGhContentService.prototype.start = function() {
  if (this._isListening) return;
  this._isListening = true;
  server = this._app.listen(this.port);
};

SMSGhContentService.prototype.stop = function() {
  this._isListening = false;
  server.close();
};

SMSGhContentService.prototype._parse = function(query) {
  return {
    authoredAt: new Date(query.Date),
    fetchedAt: new Date(),
    author: query.From,
    // campaign: query.Campaign,
    // If required, and necessary accommodations are made on the front end
    content: query.Fulltext
  };
};

module.exports = SMSGhContentService;
