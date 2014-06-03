var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');

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

  // Determine Source ID of object
  var source = 'SELECT id, site, type, url FROM object_url WHERE url = "' + this.url + '"';

  // Fetch posts and comments
  var posts = 'SELECT source_id, post_id, updated_time, created_time, actor_id, permalink, message, comments.comment_list';
  posts += ' FROM stream';
  posts += ' WHERE source_id IN (SELECT id FROM #source)';
  // New comments trigger a fresh updated_time in its parent post
  if (this.lastReportDate) posts += ' AND updated_time > ' + this.lastReportDate;
  posts += ' ORDER BY updated_time';

  graph.fql({source: source, posts: posts}, function(err, res) {
    if (err) self._handleErrors(err);
    res.data.forEach(function(data) {
      switch (data.name) {
        case 'source':
          if (data.fql_result_set.length === 0) self._handleErrors(new Error('Invalid Facebook URL'));
          break;
        case 'posts':
          if (data.fql_result_set.length) self._handleResults(data.fql_result_set);
          callback(null, self.lastReportDate * 1000);
          break;
      }
    });
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
FacebookContentService.prototype._handleResults = function(data) {
  var self = this;
  var lastReportDate = 0;
  // Handle each post
  data.forEach(function(post) {
    // `updated_time` only gets refreshed when posting a new comment. Use these
    // reports only when they are new or from a newly added Source.
    if (!self.lastReportDate || post.created_time === post.updated_time) {
      lastReportDate = Math.max(lastReportDate, post.updated_time);
      self.emit('report', self._parse(post, {type: 'post'}));
    }
    if (post.comments.comment_list.length) {
      // Handle each comment
      post.comments.comment_list.forEach(function(comment) {
        lastReportDate = Math.max(lastReportDate, comment.time);
        self.emit('report', self._parse(comment, {type: 'comment', post: post}));
      });
    }
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
        author: data.actor_id,
        url: data.permalink
      };
    case 'comment':
      return {
        authoredAt: data.time * 1000,
        fetchedAt: Date.now(),
        content: data.text,
        author: data.fromid,
        url: this._buildCommentUrl(data.id, options.post)
      };
  }
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
