var FeedParser = require('feedparser');
var request = require('request');
var resanitize = require('resanitize');
var ContentService = require('../content-service');
var util = require('util');

var RSSContentService = function(options) {
  this.url = options.url;
  this.sourceType = 'rss';
  this.botType = 'pull';
  this.lastReportDate = options.lastReportDate || null;
  ContentService.call(this);
};

util.inherits(RSSContentService, ContentService);

// Fetch new data from service
RSSContentService.prototype.fetch = function(callback) {
  var self = this;
  var warnings = [];
  var feedparser = new FeedParser();
  request(this.url)
    .on('response', function(res) {
      if (res.statusCode != 200) return self.emit('error', new Error.HTTP(res.statusCode));
      var reports = [];
      // Pipe RSS/XML stream to feedparser
      this.pipe(feedparser)
        .on('readable', function() {
          var data;
          // Read and parse stream data
          while (null !== (data = this.read())) {
            if (!data.date) {
              var dateWarning = new Error('Parse warning: RSS element is missing the date');
              warnings.push(dateWarning);
              self.emit('warning', dateWarning);
            } else {
              var report_data = self._parse(data);
              if (!report_data.content) {
                var contentWarning = new Error('Parse warning: RSS element is missing the content');
                warnings.push(contentWarning);
                self.emit('warning', contentWarning);
              } else reports.push(report_data);
            }
          }
        })
        .on('end', function() {
          var latestDate;
          reports.forEach(function(report_data) {
            // Filter out reports from older dates
            if (report_data.authoredAt > self.lastReportDate || !self.lastReportDate) {
              // Determine latest date in this fetch
              if (report_data.authoredAt > latestDate || !latestDate) latestDate = report_data.authoredAt;
              self.emit('report', report_data);
            }
          });
          // Store latest date for future use
          if (latestDate) {
            self.lastReportDate = latestDate;
          }
          callback(warnings.length ? warnings : null, self.lastReportDate);
        })
        .on('error', function(err) {
          self.emit('error', new Error('Parse error: ' + err.message));
        });
    })
    .on('error', function(err) {
      self.emit('error', new Error('HTTP error: ' + err.message));
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
