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
var config = require('../../../config/secrets');

var DummyContentService = function(options) {
  this.config = _.clone(config.get().dummy);
  this._curItem = 0;
  this._keywords = options.keywords;
  this.fetchType = 'push';
  this._filtered = this._keywords ? _.filter(data, function(d) { return d.indexOf(options.keywords) != -1; }) : data;
};

util.inherits(DummyContentService, ContentService);

// Start/resume streaming of filtered data
DummyContentService.prototype.start = function() {
  this._isStreaming = true;
  this._emitNext();
};

// Stop the stream
DummyContentService.prototype.stop = function() {
  this._isStreaming = false;
};

DummyContentService.prototype._emitNext = function() {
  var self = this;
  this.emit('report', { content: this._filtered[this._curItem], fetchedAt: new Date() });
  this._curItem += 1;
  if (this._curItem >= this._filtered.length)
    this.stop();

  // If still streaming, emit next fake report in one millisecond.
  if (this._isStreaming)
    setTimeout(function() { self._emitNext(); }, 1);
};

DummyContentService.prototype.reloadSettings = function() {
  this.config = _.clone(config.get().dummy);
};

module.exports = DummyContentService;
