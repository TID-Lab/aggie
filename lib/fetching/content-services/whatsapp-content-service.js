'use strict';

var express = require('express');
var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');

function WhatsAppContentService(port) {
  this.fetchType = 'subscribe';
  this._isListening = false;
  this._app = express();
  this._connectedSources = {};
  this._app.use(express.urlencoded());
  var self = this;

  this._app.post('/whatsapp', function(req, res) {
    var _params = req.body;
    var reportData = self._parse(_params);
    self.emit(self._getBotId(_params.keyword), reportData);
    res.send(200);
  });

  this.port = port || 2222;
}

util.inherits(WhatsAppContentService, ContentService);


WhatsAppContentService.prototype._getBotId = function(keyword) {
  return 'whatsapp:' + keyword.toLowerCase();
};

// Keyword for whatsapp is suggested to be the phone number of the receiver.
// Keyword field value in curl request has to be the same as the one defined
//  in Aggie WhatsApp for report to be created
WhatsAppContentService.prototype.subscribe = function(id, info) {
  var botId = this._getBotId(info.keywords);
  this._connectedSources[id] = botId;
  if (!this._isListening) {
    this.server = this._app.listen(this.port);
    this._isListening = true;
  }
  return botId;
};

WhatsAppContentService.prototype.unsubscribe = function(id) {
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

WhatsAppContentService.prototype._parse = function(query) {
  var parsedQuery = {};
  this._validate(query);
  parsedQuery.authoredAt = new Date(query.date || new Date());
  parsedQuery.fetchedAt = new Date();
  parsedQuery.url = ''; // since url is part of the schema
  parsedQuery.author = query.from || 'anonymous';
  parsedQuery.keyword = query.keyword ? query.keyword.toLowerCase() : '';
  parsedQuery.content = query.text || '-NO TEXT-';
  return parsedQuery;
};

WhatsAppContentService.prototype._validate = function(data) {
  _.each(['from', 'keyword', 'text', 'date'], function(element) {
    if (!data.hasOwnProperty(element)) {
      this.emit('warning', new Error('Parse warning: WhatsApp report is missing the field ' + element));
    }
  }.bind(this));
};

module.exports = new WhatsAppContentService();
