// Fetches posts and comments efficiently from a Facebook page or group using multiquery FQL.

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
  queries.posts = 'SELECT source_id, post_id, updated_time, created_time, actor_id, permalink, message';
  queries.posts += ' FROM stream';
  queries.posts += ' WHERE source_id IN (SELECT id FROM #source)';
  // New comments trigger a fresh updated_time in its parent post
  if (this._lastReportDate) queries.posts += ' AND updated_time > ' + (this._lastReportDate.getTime()/1000);
  queries.posts += ' ORDER BY updated_time';

  // Get new comments associated with posts.
  queries.comments = "SELECT id, fromid, time, text, post_id FROM comment WHERE (post_id IN (SELECT post_id FROM #posts))";
  if (this._lastReportDate) queries.comments += ' AND time > ' + (this._lastReportDate.getTime()/1000);
  queries.comments += ' ORDER BY time';

  queries.authors = 'SELECT id, name FROM profile WHERE id IN (SELECT actor_id FROM #posts) OR id IN (SELECT fromid FROM #comments)';

  this._doRequest(queries, function(err, res) {
    if (err) {
      self.emit('error', new Error(err.message))
      return callback([]);
    }

    // This will be an array of info about the source.
    var sourceInfo = _.findWhere(res.data, {name: 'source'}).fql_result_set;

    if (sourceInfo.length === 0) {
      self.emit('error', new Error('Invalid Facebook URL'));
      callback([]);
    } else {
      var posts = _.findWhere(res.data, {name: 'posts'}).fql_result_set;
      var comments = _.findWhere(res.data, {name: 'comments'}).fql_result_set;
      var authors = _.findWhere(res.data, {name: 'authors'}).fql_result_set;
      callback(self._handleResults(posts, comments, authors));
    }
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

// Handle data returned by the FQL query. Returns an array of hashes of report data
// (does not need to be sorted, parent class handles that).
FacebookContentService.prototype._handleResults = function(posts, comments, authors) {
  var self = this;
  var reportData = [];
  var postsById = _.indexBy(posts, 'post_id');

  // Handle each post.
  posts.forEach(function(post) {
    reportData.push(self._parse(post, {type: 'post', authors: authors}));
  });

  // Handle each comment.
  comments.forEach(function(comment) {
    reportData.push(self._parse(comment, {type: 'comment', authors: authors, post: postsById[comment.post_id]}));
  });

  // Remove any that are too old.
  // (Remember, we are grabbing posts by updated_time to get at their comments, but we may have already stored them).
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
        url: options.post.permalink
      };
  }
};

// Determine the author of a report
FacebookContentService.prototype._findAuthor = function(id, authors) {
  var author = _.findWhere(authors, {id: id});
  if (author) return author.name;
  return id;
};

module.exports = FacebookContentService;
