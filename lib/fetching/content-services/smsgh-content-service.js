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
    res.send(200);
    var reportData = self._parse(_params);
    self.emit(self._getKeyword(req.query.keyword), reportData);

  });

  this.port = port || 1111;
}

util.inherits(SMSGhContentService, ContentService);

SMSGhContentService.prototype._getKeyword = function(keyword) {
  return 'sms_ghana:' + keyword.toLowerCase();
};

SMSGhContentService.prototype.subscribe = function(id, info) {
  var keyword = this._getKeyword(info.keywords);
  this._connectedSources[id] = keyword;
  if (!this._isListening) {
    this.server = this._app.listen(this.port);
    this._isListening = true;
  }
  return keyword;
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
  var returnObject = {};
  this._validate(query);
  returnObject.authoredAt = new Date(query.date || new Date());
  returnObject.fetchedAt = new Date();
  returnObject.url = ''; // since url is part of the schema
  returnObject.author = query.from || 'anonymous';
  returnObject.keyword = query.keyword || '';
  returnObject.keyword = returnObject.keyword.toLowerCase();
  returnObject.content = query.fulltext || '-NO TEXT-';
  return returnObject;
};

SMSGhContentService.prototype._validate = function(data) {
  _.each(['from', 'keyword', 'fulltext', 'date'], function(element){
    if (!data.hasOwnProperty(element)) {
      this.emit('warning', new Error('Parse warning: SMSGh report is missing the field ' + element));
    }
  }.bind(this));
};

module.exports = new SMSGhContentService();
