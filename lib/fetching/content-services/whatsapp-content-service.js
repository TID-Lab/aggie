'use strict';

var express = require('express');
var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');

function WhatsappContentService(port) {
  this.fetchType = 'subscribe';
  this._isListening = false;
  this._app = express();
  this._connectedSources = {};
  var self = this;

  this._app.get('/whatsapp', function(req, res) {

    var _params = req.query;
    res.send(200);
    var reportData = self._parse(_params);
    self.emit('whatsapp:' + req.query.receiver, reportData); // Fix this

  });

  this.port = port || 2222; // Should this change
}

util.inherits(WhatsappContentService, ContentService);

// keyword for whatsapp is the phone number of the receiver
// req.query.receiver SHOULD equal info.keywords
WhatsappContentService.prototype.subscribe = function(id, info) {
  var keyword = 'whatsapp:' + info.keywords;
  this._connectedSources[id] = keyword;
  if (!this._isListening) {
    this.server = this._app.listen(this.port);
    this._isListening = true;
  }
  return keyword;
};

WhatsappContentService.prototype.unsubscribe = function(id) {
  if (_.has(this._connectedSources, id)) {
    delete this._connectedSources[id];
  } else {
    return;
  }
  if (_.keys(this._connectedSources).length === 0) {
    this._isListening = false;
    this.server.close();
  }
  return;
};

WhatsappContentService.prototype._parse = function(query) {
  var returnObject = {};

  if (!this._validate(query)) {
    this.emit('error', new Error('Validation error, something was missing.'));
    return returnObject; // What's this?
  }

  returnObject.authoredAt = new Date(query.date);
  returnObject.fetchedAt = new Date();
  returnObject.url = ''; // since url is part of the schema
  returnObject.author = query.from;
  returnObject.keyword = query.receiver;
  // the above line can contain the phone number of the receiver
  returnObject.content = query.fulltext;
  return returnObject;
};

WhatsappContentService.prototype._validate = function(data) {
  if (!data.hasOwnProperty('from')) {
    this.emit('warning', new Error('Parse warning: WhatsApp element is missing the "from" field'));
    return false;
  }
  if (!data.hasOwnProperty('fulltext')) {
    this.emit('warning', new Error('Parse warning: WhatsApp element is missing the "fulltext" field'));
    return false;
  }
  if (!data.hasOwnProperty('receiver')) {
  	this.emit('warning', new Error('WhatsApp element is missing the "receiver" field, so report dropped'));
  }
  return true;
};

module.exports = new WhatsappContentService();