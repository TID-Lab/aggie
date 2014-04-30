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
};

util.inherits(RSSContentService, ContentService);

// Fetch new data from service
RSSContentService.prototype.fetch = function(callback) {
  var self = this;
  request(this.url)
    .on('response', function(res) {
      // Pipe HTTP stream to feedparser
      this.pipe(self.feedparser)
        .on('readable', function() {
          var data;
          // Read stream data
          while (null !== (data = this.read())) {
            var report_data = self._parse(data);
            self.emit('report', report_data);
          }
        }).on('end', callback);
    });
};

RSSContentService.prototype._parse = function(data) {
  var content = data.title ? '[' + data.title + '] ' : '';
  content += data.description ? resanitize.stripHtml(data.description) : '';
  return {
    authoredAt: data.date,
    fetchedAt: new Date(),
    content: content,
    author: data.author,
    url: data.link
  };
};

module.exports = RSSContentService;
