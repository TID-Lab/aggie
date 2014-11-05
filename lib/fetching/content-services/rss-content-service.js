// Fetches posts from an RSS feed.

var FeedParser = require('feedparser');
var request = require('request');
var resanitize = require('resanitize');
var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');
var logger = require('../../logger');

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
  callback = callback || function() {};
  var self = this;

  this._fetchStream(function(stream) {
    self._parseStream(stream, function(data) {
      callback(data);
    });
  });
  logger('RSSContentService#fetch');
  logger.debug(this);
};

// Request a stream from the feed
RSSContentService.prototype._fetchStream = function(callback) {
  var self = this;
  var req = request(this.url);
  req.on('response', function(res) {
    if (res.statusCode != 200) self.emit('error', new Error.HTTP(res.statusCode));
    callback(this);
  });
  req.on('error', function(err) {
    self.emit('error', new Error('HTTP error: ' + err.message));
  });
};

// Pipe the feed stream into the parser
RSSContentService.prototype._parseStream = function(stream, callback) {
  var self = this;
  var reports = [];
  var feedparser = new FeedParser();
  var parser = stream.pipe(feedparser);
  parser.on('readable', function() {
    var data;
    // Read and parse stream data
    while (null !== (data = this.read())) {
      var report_data = self._parse(data);
      if (self._validate(report_data) && self._isNew(report_data)) {
        reports.push(report_data);
      }
    }
  });
  parser.on('end', function(err) {
    // Sort all reports by date, then emit
    _.sortBy(reports, 'authoredAt').forEach(function(report_data) {
      self.emit('report', report_data);
      if (report_data.authoredAt > self.lastReportDate) {
        // Store latest date for future use
        self.lastReportDate = report_data.authoredAt;
      }
    });
    callback(self.lastReportDate);
  });
  parser.on('error', function(err) {
    self.emit('error', new Error('Parse error: ' + err.message));
  });
};

// Validate report data
RSSContentService.prototype._validate = function(report_data) {
  if (!report_data.authoredAt) {
    this.emit('warning', new Error('Parse warning: RSS element is missing the date'));
    return false;
  }
  if (!report_data.content) {
    this.emit('warning', new Error('Parse warning: RSS element is missing the content'));
    return false;
  }
  return true;
};

// Determine whether to skip or include a report based on its authored date
RSSContentService.prototype._isNew = function(report_data) {
  return !this.lastReportDate || report_data.authoredAt > this.lastReportDate;
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
