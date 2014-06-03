var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');

/*
 * Facebook Content Service constructor
 * @param options - (lastReportDate - Timestamp(optional),  fbPage:String(required))
 */
var FacebookContentService = function(options) {
  graph.setAccessToken(config.accessToken);
  this.fbPage = options.fbPage;
  this.lastReportDate = Math.floor(options.lastReportDate  / 1000) || null;
  this.sourceType = 'facebook';
  this.botType = 'pull';
  ContentService.call(this, options);
};

util.inherits(FacebookContentService, ContentService);

// Fetch from the Facebook Content Service
FacebookContentService.prototype.fetch = function(callback) {
  var query = 'SELECT post_id, updated_time, created_time, actor_id, permalink, message, comments.comment_list ';
  query += 'FROM stream ';
  query += "WHERE (source_id = '" + this.fbPage + "'";
  if (this.lastReportDate) {
    query += ' AND (updated_time > ' + this.lastReportDate;
    query += ' OR created_time > ' + this.lastReportDate;
    query += ' OR comments.comment_list.time > ' + this.lastReportDate;
    query += ')';
  }
  query += ') ORDER BY updated_time';
  this.runFQL(query, callback);
};

// Run the FQL query
FacebookContentService.prototype.runFQL = function(query, callback) {
  callback = callback || function() {};
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

    if (res.data.length) {
      // Handle each post
      res.data.forEach(function(post) {
        self.lastReportDate = Math.max(self.lastReportDate, post.updated_time);
        self._handleFqlResult(post, {type: 'post'});
        if (post.comments.comment_list.length) {
          // Handle each comment
          post.comments.comment_list.forEach(function(comment) {
            self.lastReportDate = Math.max(self.lastReportDate, comment.time);
            self._handleFqlResult(comment, {type: 'comment', post: post});
          });
        }
      });
    }
    callback(null, self.lastReportDate * 1000);
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
