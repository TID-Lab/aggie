var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');

/*
 * Facebook Content Service constructor
 * @param options - (lastFetchedAt - Timestamp(optional),  fbPage:String(required))
 */
var FacebookContentService = function(options) {
  graph.setAccessToken(config.accessToken);
  this.fbPage = options.fbPage;
  this.sourceType = 'facebook';
  this.botType = 'pull';
  ContentService.call(this, options);
};

util.inherits(FacebookContentService, ContentService);

// Fetch from the Facebook Content Service
FacebookContentService.prototype.fetch = function() {
  if (this.lastFetchedAt) {
    var query = {
      postsQuery: "SELECT post_id, updated_time, created_time, actor_id, permalink, message, comments.comment_list" +
        " FROM stream WHERE (source_id = '" + this.fbPage + "' AND updated_time > " + this.lastFetchedAt +
        " AND created_time > " + this.lastFetchedAt + ") ORDER BY updated_time"
    };
  } else {
    var query = {
      postsQuery: "SELECT post_id, updated_time, created_time, actor_id, permalink, message, comments.comment_list" +
        " FROM stream WHERE (source_id = '" + this.fbPage + "') ORDER BY updated_time"
    };
  }
  this.runFQL(query);
};

// Run the FQL query
FacebookContentService.prototype.runFQL = function(query) {
  var self = this;
  graph.fql(query, function(err, res) {
    if (err) {
      // Http error (FBGraph uses request.js internally)
      if (err.message === 'Error processing https request') {
        self.emit('error', new Error(err.exception));
      }
      // 1 API Unknown | 2 API Service warnings
      else if (err.error && (err.error.type === 0 || err.error.type === 1)) {
         self.emit('warning', new Warning('Facebook error: #{' + err.error.code + '} - #{' + err.error.type + '}: #{' +
           err.error.message + '}. Will try again.'));
      }
      // Catch any other errors
      else if (err.error) {
        self.emit('error', new Error('Facebook error: #{' + err.error.code + '} (#{' + err.error.error_subcode +
          '}) - #{' + err.error.type + '}: #{' + err.error.message + '}'));
      }
      else {
        self.emit('error', new Error(err.message));
      }
    }

    res.data[0].fql_result_set.forEach(function(post) {
      self._handleFqlResult(post, {type: 'post'});
      if (post.comments.comment_list.length) {
        post.comments.comment_list.forEach(function(comment) {
          self._handleFqlResult(comment, {type: 'comment', post: post});
        });
      }
    });
  });
};

// Handle each line returned by the FQL query
FacebookContentService.prototype._handleFqlResult = function(entry, options) {
  this.emit('report', this._parse(entry, options));
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

module.exports = FacebookContentService;
