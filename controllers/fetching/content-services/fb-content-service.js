var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');
var async = require('async');

var FacebookContentService = function(options) {

    graph.setAccessToken(config.accessToken);

    if (options.lastCrawlDate) {
        this.lastCrawlDate = options.lastCrawlDate;
    } else {
        this.lastCrawlDate = new Date().toISOString();
    }

    if (typeof options.fbPage === 'string') {
        this.fbPage = options.fbPage;
    } else {
        return "Incorrect page for POST";
    }

    this.source = 'facebook';
    this.resultsPerFetch = 100;
    this._isStreaming = false;
    this.nextPage = undefined;

};

FacebookContentService.prototype.setCrawlDate = function(crawlDate) {
    this.lastCrawlDate = crawlDate;
};

FacebookContentService.prototype.fetch = function() {

    //Saving the instance of fbContentService
    var fbContentService = this;

    var options = {
        limit: this.resultsPerFetch,
    };

    graph
        .get(((this.nextPage !== undefined) ? (this.nextPage) : (this.fbPage + '/feed/')), options, function(err, res) {
            if (err) {
                console.error(err);
            }
            //messages array
            messagesOnFeed = [];

            //comments array
            commentsOnPost = [];

            //length of array
            var responseLength = res.data.length;

            var fetchPrevPage = (new Date(res.data[fbContentService.resultsPerFetch - 1].created_time) > new Date(fbContentService.lastCrawlDate));

            //load the next batch of issues
            for (var i = responseLength - 1; i >= 0; i--) {

                var postHasData = res.data[i];
                var postHasComments = (res.data[i].comments);

                //check if date is valid for each post
                var validDate = (new Date(res.data[i].created_time) > new Date(fbContentService.lastCrawlDate));

                //debug
                if (!validDate) {
                    console.log("no new sources since last crawl date");
                }
                if (postHasData && validDate) {
                    messagesOnFeed.push(postHasData);
                }
                if (postHasComments && validDate) {
                    commentsOnPost.push(postHasComments.data[0]);
                }


                if (res.paging) {
                    if (res.paging.next && fetchPrevPage) {
                        fbContentService.nextPage = res.paging.next;
                    }
                }

            }
            console.log('Messages Length: ' + messagesOnFeed.length);
            console.log('Comments Length: ' + commentsOnPost.length);

            async.parallel([
                    function(callback) {
                        var content = fbContentService.parse(messagesOnFeed, commentsOnPost);
                        this.lastCrawlDate = new Date();
                        callback(null, 'content saved');
                        return content;
                    },
                    function(callback) {
                        var status = 'No new page fetched';
                        if (fetchPrevPage) {
                            this.lastCrawlDate = new Date();
                            status = 'New page fetched';
                            fbContentService.fetch();

                        }
                        callback(null, status);
                    }
                ],
                function(err, results) {
                    console.log(results);
                    return results;

                });
        });

    //TODO
    return 'done';
};

FacebookContentService.prototype.parse = function(messagesOnFeed, commentsOnPost) {
    return messagesOnFeed + commentsOnPost;
};

module.exports = FacebookContentService;