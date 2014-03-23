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
        this.lastCrawlDate = null;
    }

    if (typeof options.fbPage === 'string') {
        this.fbPage = options.fbPage;
    } else {
        return "Incorrect page for POST";
    }
    this.source = 'facebook';
    this.resultsPerFetch = 100;
    this._isStreaming = false;
    this.nextPagingItem = undefined;
    this.untilCrawlDate = options.untilCrawlDate;

};

FacebookContentService.prototype.setCrawlDate = function(crawlDate) {
    this.lastCrawlDate = crawlDate;
};

FacebookContentService.prototype.fetch = function() {

    //Saving the instance of fbContentService
    var fbContentService = this;

    var options = {
        since: this.lastCrawlDate,
        limit: this.resultsPerFetch,
        until: this.untilCrawlDate,
    };

    //here we check if there is a next page 
    if (this.nextPagingItem) {
        options = {
            since: this.lastCrawlDate,
            limit: this.resultsPerFetch,
            until: this.nextPagingItem,
        };
    }

    // console.log(options);
    graph
        .get(this.fbPage + '/feed/', options, function(err, res) {
            if (err) {
                console.error(err);
            }

            //messages array
            messagesOnFeed = [];
            //comments array
            commentsOnPost = [];
            //length of array
            var responseLength = res.data.length;

            // var newestPost = null;
            for (var i = responseLength - 1; i >= 0; i--) {
                
                var postHasData = res.data[i];
                var postHasComments = (res.data[i].comments);

                //check if date is valid for each post
                var validDate = (new Date(res.data[i].created_time) <= new Date(fbContentService.untilCrawlDate * 1000));

                if (postHasData && validDate) {
                    messagesOnFeed.push(postHasData);
                }
                if (postHasComments && validDate) {
                    commentsOnPost.push(postHasComments.data[0]);
                }
            }

            //helper method to remove url param
            function getURLParameter(name, url) {
                return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ""])[1].replace(/\+/g, '%20')) || null;
            }

            if (res.paging && res.paging.next) {

                //This part is very confusing, paging.next gives me a previus entry
                fbContentService.next = getURLParameter('until', res.paging.next);
                // console.log(fbContentService.next);

                async.parallel([
                        function(callback) {
                            var content = fbContentService.parse(messagesOnFeed, commentsOnPost);
                            callback(null, 'content saved');
                            return content;
                        },
                        function(callback) {
                            fbContentService.fetch();
                            callback(null, 'Fetched new source');
                        }
                    ],
                    function(err, results) {
                        console.log(results);
                        return results;

                    });
            }
        });

    return 'done';
};

FacebookContentService.prototype.parse = function(messagesOnFeed, commentsOnPost) {
    console.log(messagesOnFeed.length);
    console.log(commentsOnPost.length);

    return messagesOnFeed + commentsOnPost;
};

module.exports = FacebookContentService;