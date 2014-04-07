var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');
var async = require('async');

/* 
  Facebook Content Service constructor
  @param options - (lastCrawlDate - Date(optional), resultsPerFetch: String(optional),  fbPage:String(required))
*/
var FacebookContentService = function(options) {

    graph.setAccessToken(config.accessToken);

    this.lastCrawlDate = options.lastCrawlDate || new Date().toISOString();


    // TODO TOM: You don't need to check the type here I think. Source should be responsible for validating the URL.
    // Also returning a string with an error message doesn't make much sense.
    // You could have a guard clause like if (!options.fbPage) throw "Incorrect ...";
    // Once #1120 is done you can refactor.
    if (!options.fbPage) {
        return "Incorrect page for POST";
    } else {
        this.fbPage = options.fbPage;
    }

    this.source = 'facebook';

    this.resultsPerFetch = options.resultsPerFetch || 100;
    this._isStreaming = false;
    this._nextPage = undefined;
};

util.inherits(FacebookContentService, ContentService);


FacebookContentService.prototype.fetch = function() {

    var self = this;

    var options = {
        limit: this.resultsPerFetch,
    };

    graph
        .get(((this.nextPage !== undefined) ? (this.nextPage) : (this.fbPage + '/feed/')), options, function(err, res) {
            // TODO: TOM: Will need a better way to handle errors. Stay tuned. See issue #1120.
            if (err) {
                console.error(err);
            }

            messagesOnFeed = [];

            commentsOnPost = [];

            var responseLength = res.data.length;

            // TODO : TOM: This whole piece of logic can also be moved into a private method (this method is quite huge as it is).
            var fetchPrevPage = res.data[responseLength - 1].created_time > self.lastCrawlDate;

            // Load the next batch of issues
            for (var i = responseLength - 1; i >= 0; i--) {

                // DONE TOM: Why not just call these 'data' and 'comments'?
                var data = res.data[i];
                var comments = (res.data[i].comments);

                // check if date is valid for each post
                var validDate = res.data[i].created_time > self.lastCrawlDate;

                // TOM: I don't really understand what happens after this point. We should setup a meeting to chat.
                if (!validDate) {
                    console.log("no new sources since last crawl date");
                }
                if (data && validDate) {
                    messagesOnFeed.push(data);
                }
                if (comments && validDate) {
                    commentsOnPost.push(comments.data[0]);
                }

                if (res.paging) {
                    if (res.paging.next && fetchPrevPage) {
                        self.nextPage = res.paging.next;
                    }
                }
            }
            console.log('Messages Length: ' + messagesOnFeed.length);
            console.log('Comments Length: ' + commentsOnPost.length);

            async.parallel([
                    function(callback) {
                        var content = self.parse(messagesOnFeed, commentsOnPost);
                        this.lastCrawlDate = new Date();
                        callback(null, 'content saved');
                        return content;
                    },
                    function(callback) {
                        var status = 'No new page fetched';
                        if (fetchPrevPage) {
                            this.lastCrawlDate = new Date();
                            status = 'New page fetched';
                            self.fetch();
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