/*
Facebook Content Service using Facebook Graph API v2.5

This content service uses the Graph API to grab data from both Facebook pages, and groups. There are many usage
limitations set by the API which this file must acknowledge if any changes are to be made, the details are found below:

  - The way in which the API handles requests for Groups and Pages differ. The general idea is that Pages are static
  and groups are dynamic. The result is that the "since" parameter used in the request has different meaning for the
  two different objects. For Groups, the API grabs all posts where updated_time >= "since value". For Pages,
  the API grabs all posts where created_time >= "since value".

  - There are usage limitations set by the API that limit the amount of requests that the app can make per hour, if the
  limit is reached, calls will be blocked for 30 mins. In general, send out as few request as possible and keep them
  light.
  Details on rate limitation can be found here: https://developers.facebook.com/docs/marketing-api/api-rate-limiting

  - The comments field being used in the request in not documented on the Graph API Reference, we use this field to
   reduce the number of requests needed to fetch both posts and comments.

  - Posts are by default limited to 10 per request, the rest can be retrieved by using the paging field.

The current implementation is that the service fetches one pages worth of posts(default: 10), then waits on the interval
to fetch the next 10. Any duplicate posts will be filtered out by the _lastReportDate.

  - Service does not use the "since" param because of the different responses

  - Service does not use paging because of usage limits

  - This service will miss posts and comments if more than 10 posts are made since the last fetch

  - This service will miss comments on any posts more than 10 posts old
*/

var config = require('../../../config/secrets').get().facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');
var _ = require('underscore');

// options.url - The url of the Facebook resource
// options.lastReportDate - The time of the last report already fetched (optional)
var FacebookContentService = function(options) {
  graph.setVersion('2.5');
  graph.setAccessToken(config.accessToken);

  this.fetchType = 'pull';
  this._url = options.url;
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

  this._doRequest(source, function(err, data) {
    if (err) {
      self.emit('error', new Error(err.message));
      return callback([]);
    }
    callback(self._handleResults(data));
  });
};

FacebookContentService.prototype._getSourceFromUrl = function(url) {
  var URLREGEX = new RegExp('([^/?]+)(?=/?(?:$|\\?))');

  return URLREGEX.exec(url)[0];
};

FacebookContentService.prototype._doRequest = function(source, callback) {
  var params = {
    fields: 'id,name,created_time,updated_time,from,message,link,comments.order(reverse_chronological)',
    order: 'reverse_chronological'
  };

  graph.get(source + '/feed', params, function(err, res) {
    if (err) {
      callback(err, [])
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

  data.forEach(function(object) {
      // Handle each post and any comments already attached to it
      reportData.push(self._parse(object, {type: 'post'}));
      if (object.comments && object.comments.data && object.comments.data.length > 0) {
        object.comments.data.forEach(function(comment) {
          reportData.push(self._parse(comment, {type: 'comment', url: object.link}));
        });
      }
  });

  //Filter out old data if any
  if (self._lastReportDate)
    reportData = _.filter(reportData, function(rd) { return rd.authoredAt > self._lastReportDate });

  return reportData;
};

FacebookContentService.prototype._parse = function(data, options) {
  switch(options.type) {
    case 'post':
      return {
        authoredAt: new Date(data.created_time),
        fetchedAt: new Date(),
        content: this._getValueOrEmptyString(data.message),
        author: this._getValueOrEmptyString(data.from.name),
        url: this._getValueOrEmptyString(data.link)
      };
    case 'comment':
      return {
        authoredAt: new Date(data.created_time),
        fetchedAt: new Date(),
        content: this._getValueOrEmptyString(data.message),
        author: this._getValueOrEmptyString(data.from.name),
        url: this._getValueOrEmptyString(options.url)
      };
    default:
      return {
        authoredAt: new Date(data.created_time),
        fetchedAt: new Date(),
        content: this._getValueOrEmptyString(data.message),
        author: this._getValueOrEmptyString(data.from.name),
        url: this._getValueOrEmptyString(data.link)
      }
  }
};

FacebookContentService.prototype._getValueOrEmptyString = function(value) {
  return (typeof value != 'undefined' && value != null) ? value : "";
};

module.exports = FacebookContentService;
