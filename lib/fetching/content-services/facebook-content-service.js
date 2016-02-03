// Fetches posts and comments efficiently from a Facebook page or group using multiquery Facebook Graph API v2.2.

var config = require('../../../config/secrets').get().facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');
var _ = require('underscore');

// options.url - The url of the Facebook resource
// options.lastReportDate - The time of the last report already fetched (optional)
var FacebookContentService = function(options) {
  graph.setAccessToken(config.accessToken);
  this.fetchType = 'pull';
  this._url = options.url;
  this.posts = {};
  ContentService.call(this, options);
};

util.inherits(FacebookContentService, ContentService);

// Fetch from the Facebook Content Service
// options.maxCount - Max number of reports that will be accepted. (required)
// callback(reportData) - Callback via which to return fetched report data.
// We don't actually care about maxCount in this function, we just rely on Facebook's API limits to limit data per fetch.
// If we return too many items, that is ok, the parent class will handle it.
FacebookContentService.prototype._doFetch = function(options, callback) {
  var self = this;

  if (!this._url) {
    process.nextTick(function () {
      self.emit('error', new Error('Missing Facebook URL'));
    });
    callback([]);
    return;
  }

  var source = this._url.trim();

  // Parse out source name from url
  if (source.indexOf('?') === -1) {
    source = source.split('?')[0];
  }

  if (source.lastIndexOf('/') === source.length - 1) {
    source = source.substring(0, source.length - 1);
  }

  source = source.substring(source.lastIndexOf('/'), source.length);


  this._doRequest(source, function(err, data) {
    if (err) {
      self.emit('error', new Error(err.message));
      return callback([]);
    }
    callback(self._handleResults(data, source));
  })
};

FacebookContentService.prototype._doRequest = function (source, callback) {
  var self = this;
  var data = [];
  var params = {};
  if (this._lastReportDate) {
    params.since = this._lastReportDate.getTime() / 1000;
  }
  // Grab posts off of sources feed
  self._doGet('/v2.2/' + source + '/feed', params, data, callback);

  //If no new posts, grab comments off of most recent post
  if((!data || data.length == 0) && this.posts[source] != null) {
    self._doGet('/v2.2/' + this.posts[source].id + '/comments?order=reverse_chronological', {}, data, callback);
  }
};

FacebookContentService.prototype._doGet = function(url, params, data, callback) {
  var self = this;

  graph.get(url , params, function(err, res) {
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

FacebookContentService.prototype._handleResults = function(data, source) {
  var self = this;
  var oldPost = this.posts[source];
  var reportData = [];

  if (!data) {
    return reportData;
  }

  data.forEach(function(object) {
    //If object has a type then it is a post, else it is a comment
    if (object.type) {
      // Handle each post and any comment already attached to it
      reportData.push(self._parse(object, {type: 'post'}));
      if (object.comments && object.comments.data && object.comments.data.length > 0 ) {
        object.comments.data.forEach(function(comment) {
          reportData.push(self._parse(comment, {type: 'comment', url: object.link}));
        });
      }
    } else {
      reportData.push(self._parse(object, {type: 'comment', url: oldPost.link }))
    }
  });

  //Store most recent post id to retrieve post comments
  if (data[0] && data[0].type && data[0].id) {
    this.posts[source] = {
      id: data[0].id,
      link: data[0].link
    };
  }

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
        content: data.message,
        author: data.from.name,
        url: data.link
      };
    case 'comment':
      return {
        authoredAt: new Date(data.created_time),
        fetchedAt: new Date(),
        content: data.message,
        author: data.from.name,
        url: options.url
      };
  }
};

module.exports = FacebookContentService;
