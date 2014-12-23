// Fetches posts and comments efficiently from a Facebook page or group using multiquery FQL.

var config = require('../../../config/secrets').get().facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');
var _ = require('underscore');

/*
 * Facebook Content Service constructor
 * @param options - (lastReportDate - Timestamp(optional),  url:String(required))
 */
var FacebookContentService = function(options) {
  graph.setAccessToken(config.accessToken);
  this.url = options.url;
  this.lastReportDate = Math.floor(options.lastReportDate  / 1000) || null;
  this.sourceType = 'facebook';
  this.botType = 'pull';
  ContentService.call(this, options);
};

util.inherits(FacebookContentService, ContentService);

// Fetch from the Facebook Content Service
FacebookContentService.prototype.fetch = function(callback) {
  callback = callback || function() {};
  var self = this;

  if (!this.url) {
    process.nextTick(function() {
      self._handleErrors(new Error('Missing Facebook URL'));
    });
    return;
  }

  var queries = {};

  // Determine Source ID of object
  queries.source = 'SELECT id, site, type, url FROM object_url WHERE url = "' + this.url + '"';

  // Fetch posts and comments
  queries.posts = 'SELECT source_id, post_id, updated_time, created_time, actor_id, permalink, message';
  queries.posts += ' FROM stream';
  queries.posts += ' WHERE source_id IN (SELECT id FROM #source)';
  // New comments trigger a fresh updated_time in its parent post
  if (this.lastReportDate) queries.posts += ' AND updated_time > ' + this.lastReportDate;
  queries.posts += ' ORDER BY updated_time';

  // Get author names
  queries.author = 'SELECT id, name FROM profile WHERE id IN (SELECT actor_id FROM #posts) OR id IN (SELECT fromid FROM #comments)';

  // get comments associated with posts
  queries.comments = "SELECT id, fromid, time, text, post_id FROM comment WHERE" +
        " (post_id IN (SELECT post_id FROM #posts))";

  if (this.lastReportDate) queries.comments += ' AND time > ' + this.lastReportDate;
  queries.comments += ' ORDER BY time';

  graph.fql(queries, function(err, res) {
    if (err) self._handleErrors(err);
    if (res && res.data && res.data.length) {
      res.data.forEach(function(data) {
        switch (data.name) {
          case 'source':
            if (data.fql_result_set.length === 0) self._handleErrors(new Error('Invalid Facebook URL'));
            break;
          case 'posts':
            var authors = _.findWhere(res.data, {name: 'author'}).fql_result_set;
            var comments = _.findWhere(res.data, {name: 'comments'}).fql_result_set;
            if (data.fql_result_set.length) self._handleResults(data.fql_result_set, authors, comments);
            callback(null, self.lastReportDate * 1000);
            break;
        }
      });
    }
  });
};

// Handle errors
FacebookContentService.prototype._handleErrors = function(err) {
  if (err.exception) {
    // FBGraph module error
    this.emit('error', err.exception);
  } else if (err.error && (err.error.type === 0 || err.error.type === 1)) {
    // 1 API Unknown | 2 API Service warnings
    this.emit('warning', new Error('Facebook error: #{' + err.error.code + '} - #{' + err.error.type + '}: #{' + err.error.message + '}. Will try again.'));
  } else if (err.error) {
    // Catch any other Facebook API errors
    this.emit('error', new Error('Facebook error: #{' + err.error.code + '} (#{' + err.error.error_subcode +
      '}) - #{' + err.error.type + '}: #{' + err.error.message + '}'));
  } else {
    // Catch any other type of error
    this.emit('error', err);
  }
};

// Handle data returned by the FQL query
FacebookContentService.prototype._handleResults = function(data, authors, comments) {
  var self = this;
  var lastReportDate = 0;
  var reports = [];
  var commentsMap = this._buildCommentMap(comments);

  // Handle each post
  data.forEach(function(post) {
    var postComments = commentsMap[post.post_id] || [];

    // `updated_time` only gets refreshed when posting a new comment. Use these
    // reports only when they are new or from a newly added Source.
    if (!self.lastReportDate || post.created_time === post.updated_time) {
      lastReportDate = Math.max(lastReportDate, post.updated_time);
      var report_data = self._parse(post, {type: 'post', authors: authors});
      reports.push(report_data);
    }

    // Handle each comment
    postComments.forEach(function(comment) {
      // Skip old comments
      if (comment.time > self.lastReportDate) {
        lastReportDate = Math.max(lastReportDate, comment.time);
        var report_data = self._parse(comment, {type: 'comment', post: post, authors: authors});
        reports.push(report_data);
      }
    });

  });
  // Comments are loaded as children of posts, sort after the fact to ensure proper chronology
  reports = _.sortBy(reports, 'authoredAt').forEach(function(report_data) {;
    self.emit('report', report_data);
  });
  this.lastReportDate = lastReportDate;
};

// Parse each fql result into our data format
FacebookContentService.prototype._parse = function(data, options) {
  switch (options.type) {
    case 'post':
      return {
        authoredAt: data.updated_time * 1000,
        fetchedAt: Date.now(),
        content: data.message,
        author: this._findAuthor(data.actor_id, options.authors),
        url: data.permalink
      };
    case 'comment':
      return {
        authoredAt: data.time * 1000,
        fetchedAt: Date.now(),
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

// Turn comments array into comments map where represents post_id
FacebookContentService.prototype._buildCommentMap = function(comments) {
  if (!comments) return [];
  
  return comments.reduce(function(memo, comment) {
    var postId = comment.post_id;
    memo[postId] = memo[postId] || [];
    memo[postId].push(comment); 
    return memo;
  }, {});
};

module.exports = FacebookContentService;
