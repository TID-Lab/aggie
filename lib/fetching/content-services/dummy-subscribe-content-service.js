// Used for testing purposes.

var data = [
  'Lorem ipsum dolor sit amet',
  'The quick brown fox jumps over the lazy dog',
  'Hello world!',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyx',
  '1 one',
  '2 two',
  '3 three',
  '4 four',
  'One one',
  'Two two',
  'Three three',
  'Four four'
];

var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');
var express = require('express');

var server;
// var config = require('../../../config/secrets');

  var getKeyword = function (req) {
    return ("test:"+req.query.keyword);
  }

var DummySubscribeContentService = function(options) {
  // this.config = _.clone(config.get().dummy);
  this._curItem = 0;
  this._keywords = options.keywords;
  this.fetchType = 'subscribe';
  this._app = express();
  this.source_counter = 0;
  this._isListening = false;
  var self = this;
  // this._filtered = this._keywords ? _.filter(data, function(d){ return d.indexOf(options.keywords) != -1; }) : data;
  this._app.get('/dummy', function(req, res) {
    console.log("Entered this");
    var _params = req.query;
    console.log(_params);
    res.send(200);
    var reportData = self._parse(_params);
    console.log(reportData);
    console.log(getKeyword(req));
    self.emit(getKeyword(req), reportData);
    console.log("Emitted");
  });

  this.port = 1111;

};

util.inherits(DummySubscribeContentService, ContentService);

// Start/resume streaming of filtered data
DummySubscribeContentService.prototype.subscribe = function(identifier) {
  console.log("Reached this!");
   if (this.source_counter === 0) {
    this._isListening = true;
    server = this._app.listen(this.port);
  }
  this.source_counter += 1;
  // check for warning or error
  console.log("test:"+identifier);
  return 'test:' + identifier;
};

// Stop the stream
DummySubscribeContentService.prototype.unsubscribe = function() {
  this.source_counter -= 1;
  if (this.source_counter === 0) {
    this._isListening = false;
    server.close();
  }
};

DummySubscribeContentService.prototype._parse = function(query) {
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

module.exports = DummySubscribeContentService;
