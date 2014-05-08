var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');

/*
* TODO
* Testing 
*/

/* 
 * Facebook Content Service constructor
 * @param options - (lastCrawlDate - Date(optional),  fbPage:String(required))
 */
var FacebookContentService = function(options) {

  graph.setAccessToken(config.accessToken);
  this.lastCrawlDate = options.lastCrawlDate || Math.round(Date.now() / 1000);

  if (!options.fbPage) {
    return "Incorrect page for POST";
  }
  else {
    this.fbPage = options.fbPage;
  }

  this.sourceType = 'facebook';
  this.botType = 'pull';
  ContentService.call(this, options);

};

util.inherits(FacebookContentService, ContentService);

/*
 * Fetch from the Facebook Content Service
 */
FacebookContentService.prototype.fetch = function() {
  var self = this;

  var query = {
    postsQuery: "SELECT post_id, updated_time, created_time, actor_id, permalink, message " +
    "FROM stream WHERE (source_id=" + this.fbPage + " AND updated_time>" + this.lastCrawlDate +
    "AND created_time>"+ this.lastCrawlDate +") ORDER BY updated_time",
    commentsQuery: "SELECT id, fromid, time, text FROM comment WHERE" +
    "(post_id IN (SELECT post_id FROM #postsQuery) AND time>" + this.lastCrawlDate + ") ORDER BY time",
  };
  
  graph.fql(query, function(err, res) {
    if (err) {

        // Internal http request (FBGraph uses request.js internally)
        if (err.message === 'Error processing https request') {
          self.emit('error', new Error(err.exception));
        }
        // 1 API Unknown 2 API Service warnings
        else if (err.error.type === 0 || err.error.type === 1) {
           self.emit('warning', new Warning('Facebook error: #{'+err.error.code+'} - #{'+err.error.type+'}: #{'+err.error.message+'}. Will try again.'));
        }
        // Catch any other errors
        else {
          self.emit('error', new Error('Facebook error: #{'+err.error.code+'} (#{'+err.error.error_subcode+'}) - #{'+err.error.type+'}: #{'+err.error.message+'}'));
        }
    }

    res.data[0].fql_result_set.forEach(function(entry) {
      self._handleFqlResult(entry, {type: 'post'});
    });

    res.data[1].fql_result_set.forEach(function(entry) {
      self._handleFqlResult(entry, {type: 'comment'});
    });
  });
};

/*
 * Handle each line returned by the FQL query
 */
FacebookContentService.prototype._handleFqlResult = function(entry, isPost) {
  this.emit('report', this._parse(entry, isPost));
};

/*
 * Builder function for making a comment url for posts
 */
FacebookContentService.prototype._buildCommentUrl = function(id) {
    return 'http://facebook.com/posts/' + id.substring(0, 17) + '?comment_id=' + id.substring(18, 38);
};

/*
 * Parse each fql result into our data format
 */
FacebookContentService.prototype._parse = function(data, isPost) {
  return {
    authoredAt: (isPost == 'post') ? data.updated_time : data.time,
    fetchedAt: Date.now(),
    content: (isPost == 'post') ? data.message : data.text,
    author: (isPost == 'post') ? data.actor_id : data.fromid,
    url: (isPost == 'post') ? data.permalink : this._buildCommentUrl(data.id),
  };
};

module.exports = FacebookContentService;