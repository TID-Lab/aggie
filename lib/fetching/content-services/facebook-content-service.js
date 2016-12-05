/* eslint-disable camelcase */
/*
Facebook Content Service using Facebook Graph API v2.5

This content service uses the Facebook Graph API to grab data from both Facebook pages and groups.
There are many usage limitations set by the API which this file must acknowledge if any changes
are to be made, the details are found below:

  - The way in which the API handles requests for Groups and Pages differ. The general idea is
    that Pages are static and Groups are dynamic. More specifically, the "since" parameter used
    in the GET request has different meanings for the two different objects. For Groups, the API grabs
    all posts where updated_time >= "since value". For Pages, the API grabs all posts where
    created_time >= "since value".

  - There are usage limitations set by the API that limit the amount of requests that the app can make
    per hour, if the limit is reached, calls will be blocked for 30 mins. In general, send out as few
    requests as possible and keep them light.
    Details on rate limitation can be found here:
    https://developers.facebook.com/docs/marketing-api/api-rate-limiting

  - The "comments" GET field parameter being used in the current implementation is not documented
    in the Graph API Reference. We use this field to reduce the number of requests needed to fetch
    both posts and comments.

  - Posts are by default limited to 10 per request, the rest can be retrieved by using the paging field.

The current implementation is as follows: The service fetches one page worth of most recent posts
(default: 10), then waits on the interval to fetch another 10. Any duplicate posts will be filtered
out by the _lastReportDate.

  - Service does not use the "since" param because of the different responses for the different object types.

  - Service does not use paging because of usage limits.

  - This service will miss any posts beyond 10 that have been made since the last fetch.
    e.g If 12 posts were made since the last fetch the 1rst and 2nd(oldest) posts will be missed.

  - This service will miss comments on any posts more than 10 posts old.
    Comments are attached the posts, so no comments on any posts older than the 10th oldest one
    will be retrieved.

  - It will also miss any comments beyond 10 that have been made since the last fetch.
*/

var config = require('../../../config/secrets');
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');
var _ = require('lodash');

// From https://developers.facebook.com/docs/graph-api/using-graph-api/#errors
var transientErrorCodes = [1, 2, 4, 17, 341];
// fbgraph also emits its own transient errors
var transientErrorMessages = [
  'Error: Error parsing json',
  'Error: Error processing https request'
];
// options.url - The url of the Facebook resource
// options.lastReportDate - The time of the last report already fetched (optional)
var FacebookContentService = function(options) {
  graph.setVersion('2.8');
  graph.setAccessToken(config.get().facebook.accessToken);
  this.fetchType = 'pull';
  this._url = options.url;
  this._getParams = {
    fields: 'id,name,created_time,updated_time,from,message,link,permalink_url,comments.order(reverse_chronological),reactions.limit(1).summary(true),likes.limit(1).summary(true),place',
    order: 'reverse_chronological'
  };
  this._urlRegex = '([^/?]+)(?=/?(?:$|\\?))';
  ContentService.call(this, options);
};

util.inherits(FacebookContentService, ContentService);

// Fetch from the Facebook Content Service
// callback(reportData) - Callback via which to return fetched report data.
// If we return too many items, that is ok, the parent class will handle it.
FacebookContentService.prototype._doFetch = function(options, callback) {
  var self = this;

  if (!this._url) {
    process.nextTick(function() {
      self.emit('error', new Error('Missing Facebook URL'));
    });
    callback([]);
    return;
  }

  var source = this._getSourceFromUrl(this._url);

  if (source == null) {
    process.nextTick(function() {
      self.emit('error', new Error('Invalid URL'));
    });
    callback([]);
    return;
  }

  var isTransient = function(error) {
    var transient;
    if (error.code) {
      transient = _.includes(transientErrorCodes, error.code);
    } else {
      transient = _.includes(transientErrorMessages, error.message);
    }
    return transient;
  };

  this._doRequest(source, function(err, data) {
    if (err) {
      var level = 'error';
      if (isTransient(err)) level = 'warning';
      process.nextTick(function() {
        self.emit(level, new Error(err.message));
      });

      return callback([]);
    }
    callback(self._handleResults(data));
  });
};

FacebookContentService.prototype._getSourceFromUrl = function(url) {
  var URLREGEX = new RegExp(this._urlRegex);

  return URLREGEX.exec(url)[0];
};

FacebookContentService.prototype._doRequest = function(source, callback) {
  graph.get(source + '/feed', this._getParams, function(err, res) {
    if (err) {
      callback(err, []);
    } else if (res.data && res.data.length > 0) {
      callback(err, res.data);
    }
  });
};

FacebookContentService.prototype._handleResults = function(data) {
  var self = this;
  var reportData = [];

  if (!data) {
    return reportData;
  }

  data.forEach(function(post) {
      // Handle each post and any comments already attached to it
    post.isComment = false;
    reportData.push(self._parse(post));
    if (post.comments && post.comments.data && post.comments.data.length > 0) {
      post.comments.data.forEach(function(comment) {
        comment.permalink_url = 'https://www.facebook.com/' + comment.id;
        comment.isComment = true;
        reportData.push(self._parse(comment));
      });
    }
  });

  // Filter out old data if any
  if (self._lastReportDate) {
    reportData = _.filter(reportData, function(rd) {
      return rd.authoredAt > self._lastReportDate;
    });
  }

  return reportData;
};

FacebookContentService.prototype._parse = function(data) {
  var metadata = {
    likeCount: data.likes ? data.likes.summary.total_count : 0,
    reactionCount: data.reactions ? data.reactions.summary.total_count : 0,
    place: data.place ? data.place : '',
    link: data.link ? data.link : '',
    isComment: Boolean(data.isComment)
  };
  return {
    authoredAt: new Date(data.created_time),
    fetchedAt: new Date(),
    content: this._getValueOrEmptyString(data.message),
    author: this._getValueOrEmptyString(data.from.name),
    url: this._getValueOrEmptyString(data.permalink_url),
    metadata: metadata
  };
};

FacebookContentService.prototype._getValueOrEmptyString = function(value) {
  return typeof value != 'undefined' && value != null ? value : '';
};

FacebookContentService.prototype.reloadSettings = function() {
  graph.setAccessToken(config.get().facebook.accessToken);
  this._authToken = config.authToken;
};
module.exports = FacebookContentService;
