'use strict';

// var http = require('http');
// var url = require('url');
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

  // '/smsghana' below can be changed based on requirement. ('/' may be fine).
  this._app.get('/smsghana', function(req, res) {

    var _params = req.query;
    // console.log("request received");
    // console.log(_params);
    res.send(200);
    // console.log("response sent");
    var reportData = self._parse(_params);
    // Emit the report
    // console.log("request parsed");
    // console.log(reportData);
    self.emit('report', reportData);
    // console.log("report emitted");
  });

  this.port = port || 1111;
};


util.inherits(SMSGhContentService, ContentService);

SMSGhContentService.prototype.foo = function() {
  this.emit('report', {});
}

SMSGhContentService.prototype.start = function() {
  if (this._isListening) return;
  this._isListening = true;
  // listen on the server
  server = this._app.listen(this.port);
};

SMSGhContentService.prototype.stop = function() {
  this._isListening = false;
  // Stop the server
  server.close();
};

SMSGhContentService.prototype._parse = function(query) {
  // console.log("entered");
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
