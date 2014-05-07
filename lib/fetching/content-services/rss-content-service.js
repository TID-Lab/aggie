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
  callback = callback || function() {};
  var self = this;

  this._fetchStream(function(err, stream) {
    if (err) return callback(err);
    self._parseStream(stream, function(err, data) {
      if (err) return callback(err);
      callback(null, data);
    });
  });
};

// Request a stream from the feed
RSSContentService.prototype._fetchStream = function(callback) {
  var self = this;
  var req = request(this.url);
  req.on('response', function(res) {
    if (res.statusCode != 200) {
      var error = new Error.HTTP(res.statusCode);
      self.emit('error', error);
      callback(error);
    } else {
      callback(null, this);
    }
  });
  req.on('error', function(err) {
    var error = new Error('HTTP error: ' + err.message);
    self.emit('error', error);
    callback(error);
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
      if (self._validate(report_data)) {
        reports.push(report_data);
      }
    }
  });
  parser.on('end', function(err) {
    var latestDate;
    reports.forEach(function(report_data) {
      if (self._useReport(report_data)) {
        // Keep track of the latest date in this batch
        // Order of reports cannot be guaranteed, so we use a separate variable
        if (report_data.authoredAt > latestDate || !latestDate) latestDate = report_data.authoredAt;
        self.emit('report', report_data);
      }
    });
    // Store latest date for future use
    if (latestDate) self.lastReportDate = latestDate;
    callback(error, self.lastReportDate);
  });
  var error;
  parser.on('error', function(err) {
    error = new Error('Parse error: ' + err.message);
    self.emit('error', error);
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

// Determine whether to skip or include a report
RSSContentService.prototype._useReport = function(report_data) {
  if (report_data.authoredAt > this.lastReportDate) return true;
  if (!this.lastReportDate) return true;
  return false;
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
