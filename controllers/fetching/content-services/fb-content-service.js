var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');


var FacebookContentService = function(lastCrawlDate, page) {

    graph.setAccessToken(config.accessToken);
    if (lastCrawlDate) {
        this.lastCrawlDate = lastCrawlDate;
    }
    else {
        this.lastCrawlDate = null;
    }

    if (typeof page === 'string') {
        this.page = page;
    } else {
        return "Incorrect page for POST";
    }
    this.source = 'facebook';
    this.type = 'pull';
    this._isStreaming = false;
};

util.inherits(FacebookContentService, ContentService);

FacebookContentService.prototype.setCrawlDate = function(crawlDate) {
    this.lastCrawlDate = crawlDate;
};

FacebookContentService.prototype.parse = function() {

    //This will need to be changed into an array 
    commentsOnPost = '';

    graph.get("prezicom/feed/", function(err, res) {

        for (var i = res['data'].length - 1; i >= 0; i--) {

            var postHasComments = (res['data'][i]['comments']);

            if (postHasComments) {
                commentsOnPost += (postHasComments['data'][0].message);
            }
        }
    });

    console.log(commentsOnPost);

    return commentsOnPost;

};

module.exports = FacebookContentService;