'use strict';

var express = require('express');
var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');

function SMSGhContentService(port) {
  this.fetchType = 'subscribe';
  this._isListening = false;
  this._app = express();
  this._connectedSources = {};
  var self = this;

  this._app.get('/smsghana', function(req, res) {

    var _params = req.query;
    var reportData = self._parse(_params);
    self.emit(self._getBotId(_params.keyword), reportData);
    res.send(200);
  });

  this.port = port || 1111;
}

util.inherits(SMSGhContentService, ContentService);

SMSGhContentService.prototype._getBotId = function(keyword) {
  return 'sms_ghana:' + keyword.toLowerCase();
};

SMSGhContentService.prototype.subscribe = function(id, info) {
  var botId = this._getBotId(info.keywords);
  this._connectedSources[id] = botId;
  if (!this._isListening) {
    this.server = this._app.listen(this.port);
    this._isListening = true;
  }
  return botId;
};

SMSGhContentService.prototype.unsubscribe = function(id) {
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

SMSGhContentService.prototype._parse = function(query) {
  var parsedQuery = {};
  this._validate(query);
  parsedQuery.authoredAt = new Date(query.date || new Date());
  parsedQuery.fetchedAt = new Date();
  parsedQuery.url = ''; // since url is part of the schema
  parsedQuery.author = query.from || 'anonymous';
  parsedQuery.keyword = query.keyword ? query.keyword.toLowerCase() : '';
  parsedQuery.content = query.fulltext || '-NO TEXT-';
  return parsedQuery;
};

SMSGhContentService.prototype._validate = function(data) {
  _.each(['from', 'keyword', 'fulltext', 'date'], function(element) {
    if (!data.hasOwnProperty(element)) {
      this.emit('warning', new Error('Parse warning: SMSGh report is missing the field ' + element));
    }
  }.bind(this));
};

module.exports = new SMSGhContentService();
