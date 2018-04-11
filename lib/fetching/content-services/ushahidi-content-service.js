'use strict';

var express = require('express');
var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');

function UshahidiContentService(port) {
  this.fetchType = 'subscribe';
  this._isListening = false;
  this._app = express();
  this._connectedSources = {};
  this._app.use(express.urlencoded());
  var self = this;

  this._app.post('/ushahidi', function(req, res) {
    console.log('Got a ushahidi report');
    var _params = req.body;
    var reportData = self._parse(_params);
    self.emit(self._getBotId('temporaryXXXXX'), reportData);
    res.send(200);
  });

  this.port = port || 3333;
}

util.inherits(UshahidiContentService, ContentService);


UshahidiContentService.prototype._getBotId = function(keyword) {
  return 'ushahidi:' + keyword.toLowerCase();
};

// Keyword for ushahidi is suggested to be the phone number of the receiver.
// Keyword field value in curl request has to be the same as the one defined
//  in Aggie Ushahidi for report to be created
UshahidiContentService.prototype.subscribe = function(id, info) {
  var botId = this._getBotId(info.keywords);
  this._connectedSources[id] = botId;
  if (!this._isListening) {
    console.log('Started ushahidi listening server');
    this.server = this._app.listen(this.port);
    this._isListening = true;
  }
  return botId;
};

UshahidiContentService.prototype.unsubscribe = function(id) {
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

UshahidiContentService.prototype._parse = function(query) {
  console.log(query);
  var parsedQuery = {};
  // this._validate(query);
  // parsedQuery.authoredAt = new Date(query.date || new Date());
  // parsedQuery.fetchedAt = new Date();
  // parsedQuery.url = ''; // since url is part of the schema
  // parsedQuery.author = query.from || '';
  // parsedQuery.keyword = query.keyword ? query.keyword.toLowerCase() : '';
  // parsedQuery.content = query.text || '-NO TEXT-';
  return parsedQuery;
};

UshahidiContentService.prototype._validate = function(data) {
  _.each(['from', 'keyword', 'text', 'date'], function(element) {
    if (!data.hasOwnProperty(element)) {
      this.emit('warning', new Error('Parse warning: Ushahidi report is missing the field ' + element));
    }
  }.bind(this));
};

module.exports = new UshahidiContentService();
