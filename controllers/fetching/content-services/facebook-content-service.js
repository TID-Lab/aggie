var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');

/*
* TODO
* URL for comment - I guess I have to manually build it (do we need it?)
* Error checking
* Testing 
*/

/* 
Facebook Content Service constructor
@param options - (lastCrawlDate - Date(optional), resultsPerFetch: String(optional),  fbPage:String(required))
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


FacebookContentService.prototype.fetch = function() {
  var self = this;
  var postsQuery = "SELECT post_id, updated_time, actor_id, permalink, message FROM stream WHERE (source_id=" + this.fbPage + " AND updated_time<" + this.lastCrawlDate + ") ORDER BY updated_time";
  var commentsQuery = "SELECT id, fromid, time, text FROM comment WHERE (post_id IN (SELECT post_id FROM #postsQuery) AND time<" + this.lastCrawlDate + ") ORDER BY time";

  var query = {
    postsQuery: postsQuery,
    commentsQuery: commentsQuery
  };
  
  graph.fql(query, function(err, res) {
    if (err) {
      self.emit('error', new Error('Facebook sent error: ' + JSON.stringify(err)));
    }

    var posts = res.data[0].fql_result_set;
    if (posts) {
      posts.forEach(function(entry) {
        self._returnValidReportLine(entry, true);
      });
    }

    var comments = res.data[1].fql_result_set;
    if (comments) {
      comments.forEach(function(entry) {
        self._returnValidReportLine(entry, false);
      });
    }
  });
};

FacebookContentService.prototype._returnValidReportLine = function(entry, isPost) {
  this.emit('report', this._parse(entry, isPost));
};

FacebookContentService.prototype._parse = function(data, isPost) {
  var report_data = {
    authoredAt: (isPost) ? data.updated_time : data.time,
    fetchedAt: Date.now(),
    content: (isPost) ? data.message : data.text,
    author: (isPost) ? data.actor_id : data.fromid,
    url: (isPost) ? data.permalink : 'commenturl',
    _source: {
      type: 'facebook',
      fbPage: this.fbPage
    }
  };
  return report_data;
};

module.exports = FacebookContentService;