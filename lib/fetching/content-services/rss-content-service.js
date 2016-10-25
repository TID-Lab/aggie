// Fetches posts from an RSS feed.

var FeedParser = require('feedparser');
var request = require('request');
var resanitize = require('resanitize');
var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');
var logger = require('../../logger');

// options.url - The URL of the RSS feed.
// options.lastReportDate - The fetchedAt time of the last already fetched report (optional).
var RSSContentService = function(options) {
  this._url = options.url;
  this.fetchType = 'pull';
  ContentService.call(this, options);
};

util.inherits(RSSContentService, ContentService);

// Fetch from RSS
// options.maxCount - Max number of reports that will be accepted. (required)
// callback(reportData) - Callback via which to return fetched report data.
RSSContentService.prototype._doFetch = function(options, callback) {
  var self = this;
  var feedparser = new FeedParser();
  var reportData = [];

  this._doRequest(function(err, res, stream) {
    if (err) {
      self.emit('error', new Error('HTTP error: ' + err.message));
      callback([]);
    }

    if (res.statusCode != 200) {
      self.emit('error', new Error.HTTP(res.statusCode));
      callback([]);
    } else
      stream.pipe(feedparser);
  });

  // Handle feedparser errors.
  feedparser.on('error', function(err) {
    self.emit('error', new Error('Parse error: ' + err.message));
    callback([]);
  });

  // Each time feedparser returns a readable, add it to the array (if it's new).
  feedparser.on('readable', function() {
    var data;
    // Read and parse stream data
    while (null !== (data = this.read())) {
      var data = self._parse(data);

      // Validate, make sure it's new, and ignore any further results once maxCount is reached.
      if (self._validate(data) && self._isNew(data) && reportData.length < options.maxCount)
        reportData.push(data);
    }
  });

  // When feedparser says it's done, call callback.
  feedparser.on('end', function(err) {
    if (err) {
      logger.warning(err);
    }
    callback(reportData);
  });
};

// Makes request to RSS feed. Returns a stream object.
// callback(err, res, stream) - Callback via which to return the result object and the output stream.
RSSContentService.prototype._doRequest = function(callback) {
  var req = request(this._url);

  req.on('error', function(err) {
    callback(err);
  });

  req.on('response', function(res) {
    callback(null, res, this);
  });
};

// Validate report data
RSSContentService.prototype._validate = function(data) {
  if (!data.authoredAt) {
    this.emit('warning', new Error('Parse warning: RSS element is missing the date'));
    return false;
  }
  if (!data.content) {
    this.emit('warning', new Error('Parse warning: RSS element is missing the content'));
    return false;
  }
  return true;
};

// Determine whether to skip or include a report based on its authored date
RSSContentService.prototype._isNew = function(data) {
  return !this._lastReportDate || data.authoredAt > this._lastReportDate;
};

RSSContentService.prototype._parse = function(data) {
  var content = data.title ? '[' + data.title + '] ' : '';
  content += data.description ? resanitize.stripHtml(data.description) : '';
  return {
    authoredAt: new Date(data.date),
    fetchedAt: new Date(),
    content: content,
    author: data.author,
    url: data.link
  };
};

RSSContentService.prototype.reloadSettings = function() {};

module.exports = RSSContentService;
