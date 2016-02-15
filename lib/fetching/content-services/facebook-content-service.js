// Fetches posts and comments efficiently from a Facebook page or group using Facebook Graph API v2.5.

var config = require('../../../config/secrets').get().facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');
var _ = require('underscore');

// options.url - The url of the Facebook resource
// options.lastReportDate - The time of the last report already fetched (optional)
var FacebookContentService = function(options) {
  graph.setVersion("2.5");
  graph.setAccessToken(config.accessToken);

  this.fetchType = 'pull';
  this._url = options.url;
  ContentService.call(this, options);
};

util.inherits(FacebookContentService, ContentService);

// Fetch from the Facebook Content Service
// callback(reportData) - Callback via which to return fetched report data.
// We don't actually care about maxCount in this function, we just rely on Facebook's API limits to limit data per fetch.
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
  var self = this;
  var data = [];
  var params = {
    fields: 'id,name,created_time,updated_time,from,message,link,comments'
  };

  if (typeof this._lastReportDate != 'undefined' && this._lastReportDate != null) {
    params.since = this._lastReportDate.getTime() / 1000;
  }

  // Grab posts off of sources feed
  self._doGet(source + '/feed', params, data, callback);
};

FacebookContentService.prototype._doGet = function(url, params, data, callback) {
  var self = this;

  graph.get(url, params, function(err, res) {
    if (res.data && res.data.length > 0) {
      data = data.concat(res.data);
    }
    if (res.paging && res.paging.next) {
      self._doGet(res.paging.next, params, data, callback);
    } else {
      callback(err, data);
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

FacebookContentService.prototype._getValueOrEmptyString= function(value) {
  return (typeof value != 'undefined' && value != null) ? value : "";
};

module.exports = FacebookContentService;
