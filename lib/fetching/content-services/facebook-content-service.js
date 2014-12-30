// Fetches posts and comments efficiently from a Facebook page or group using multiquery FQL.

var config = require('../../../config/secrets').facebook;
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
    process.nextTick(function() { self.emit('error', new Error('Missing Facebook URL')); });
    callback([]);
    return;
  }

  var queries = {};

  // Determine Source ID of object
  queries.source = 'SELECT id, site, type, url FROM object_url WHERE url = "' + this._url + '"';

  // Fetch posts and comments
  queries.posts = 'SELECT source_id, post_id, updated_time, created_time, actor_id, permalink, message, comments.comment_list';
  queries.posts += ' FROM stream';
  queries.posts += ' WHERE source_id IN (SELECT id FROM #source)';
  // New comments trigger a fresh updated_time in its parent post
  if (this._lastReportDate) queries.posts += ' AND updated_time > ' + (this._lastReportDate.getTime()/1000);
  queries.posts += ' ORDER BY updated_time';

  // Get author names
  queries.authors = 'SELECT id, name FROM profile WHERE id IN (SELECT actor_id FROM #posts) OR id IN (SELECT comments.comment_list.fromid FROM #posts)';

  this._doRequest(queries, function(err, res) {
    if (err) {
      self.emit('error', new Error(err.message))
      callback([]);
    }

    res.data.forEach(function(data) {
      switch (data.name) {
        case 'source':
          // If there are no source matches, it means we didn't give a correct url.
          if (data.fql_result_set.length === 0)
            self.emit('error', new Error('Invalid Facebook URL'));
          break;
        case 'posts':
          var authors = _.findWhere(res.data, {name: 'authors'}).fql_result_set;
          callback(self._handleResults(data.fql_result_set, authors));
          break;
      }
    });
  });

};

// Runs the FQL request
// queries - The queries to run
// callback(err, data) - The callback via which to return the resulting data.
FacebookContentService.prototype._doRequest = function(queries, callback) {
  graph.fql(queries, function(err, res) {
    if (err)
      callback(err, []);
    else
      callback(null, res);
  });
};

// Handle data returned by the FQL query. Returns an array of hashes of report data.
FacebookContentService.prototype._handleResults = function(data, authors) {
  var self = this;
  var reportData = [];

  if (!data.length)
    return [];

  // Handle each post
  data.every(function(post) {

    // Add post.
    reportData.push(self._parse(post, {type: 'post', authors: authors}));

    // Add comments.
    (post.comments.comment_list || []).forEach(function(comment) {
      reportData.push(self._parse(comment, {type: 'comment', post: post, authors: authors}));
    });

    return true;
  });

  // Remove any that are too old.
  if (self._lastReportDate)
    reportData = _.filter(reportData, function(rd) { return rd.authoredAt > self._lastReportDate });

  return reportData;
};

// Parse each fql result into our data format
FacebookContentService.prototype._parse = function(data, options) {
  switch (options.type) {
    case 'post':
      return {
        authoredAt: new Date(data.created_time * 1000),
        fetchedAt: new Date(),
        content: data.message,
        author: this._findAuthor(data.actor_id, options.authors),
        url: data.permalink
      };
    case 'comment':
      return {
        authoredAt: new Date(data.time * 1000),
        fetchedAt: new Date(),
        content: data.text,
        author: this._findAuthor(data.fromid, options.authors),
        url: this._buildCommentUrl(data.id, options.post)
      };
  }
};

// Determine the author of a report
FacebookContentService.prototype._findAuthor = function(id, authors) {
  var author = _.findWhere(authors, {id: id});
  if (author) return author.name;
  return id;
};

// Builder function for making a comment url for posts
FacebookContentService.prototype._buildCommentUrl = function(commentId, post) {
  var id = commentId.split('_');
  if (/\?/.test(post.permalink)) {
    return post.permalink + '&comment_id=' + id[2];
  } else {
    return post.permalink + '?comment_id=' + id[2];
  }
};

module.exports = FacebookContentService;
