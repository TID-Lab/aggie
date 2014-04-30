var FeedParser = require('feedparser');
var request = require('request');
var resanitize = require('resanitize');
var ContentService = require('../content-service');
var util = require('util');

var RSSContentService = function(options) {
  this.feedparser = new FeedParser(options);
  this.url = options.url;
  this.sourceType = 'rss';
  this.botType = 'pull';
  ContentService.call(this);

  var self = this;
  this.feedparser.on('error', this._handleError);
  this.feedparser.on('readable', function() {
    self._handleReadableStream(this);
  });
  this.feedparser.on('end', function() {
    self.emit('end');
  });
};

util.inherits(RSSContentService, ContentService);

// Start/resume streaming of filtered data
RSSContentService.prototype.fetch = function() {
  var self = this;
  var req = request(this.url);
  req.on('error', this._handleError);
  req.on('response', function(res) {
    if (res.statusCode !== 200) self._handleError({status: res.statusCode});
    this.pipe(self.feedparser);
  });
};

RSSContentService.prototype._handleError = function(err) {
  this.emit('error', err);
};

RSSContentService.prototype._handleReadableStream = function(stream) {
  var data;
  while (data = stream.read()) {
    var report_data = this._parse(data);
    this.emit('report', report_data);
  }
};

RSSContentService.prototype._parse = function(data) {
  return {
    authoredAt: data.date,
    fetchedAt: Date.now(),
    content: data.title + ' ' + resanitize.stripHtml(data.description),
    author: data.author,
    url: data.link
  };
};

module.exports = RSSContentService;
