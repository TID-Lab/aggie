// TOM: Always name files after the exact class name. Spell out Facebook please.
// TOM: Please inherit from ContentService. See TwitterContentService.

// TOM: Nice require
var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');
var async = require('async');

// TOM: Please document the options in a comment.
var FacebookContentService = function(options) {

    // TOM: 2 space indentation please, as specified in http://nodeguide.com/style.html
    graph.setAccessToken(config.accessToken);


    // TOM: This whole block can be rewritten in one line using ||.
    // TOM: Be careful! Your default value is a string, but it looks like below that you're assuming the passed value is a Date.
    if (options.lastCrawlDate) {
        this.lastCrawlDate = options.lastCrawlDate;
    } else {
        this.lastCrawlDate = new Date().toISOString();
    }

    // TOM: You don't need to check the type here I think. Source should be responsible for validating the URL.
    // Also returning a string with an error message doesn't make much sense.
    // You could have a guard clause like if (!options.fbPage) throw "Incorrect ...";
    // Once #1120 is done you can refactor.
    if (typeof options.fbPage === 'string') {
        this.fbPage = options.fbPage;
    } else {
        return "Incorrect page for POST";
    }

    this.source = 'facebook';

    // TOM: this should probably be a private constant unless you want it to be changeable from outside.
    this.resultsPerFetch = 100;
    this._isStreaming = false;
    // TOM: Is this not a private variable? All private vars and methods should start with _.
    this.nextPage = undefined;
};

// TOM: Where does this get called from? Currently nowhere. Remove?
FacebookContentService.prototype.setCrawlDate = function(crawlDate) {
    this.lastCrawlDate = crawlDate;
};

FacebookContentService.prototype.fetch = function() {

    // TOM: The convention is to do var self = this; Then you can remove comment.
    //Saving the instance of fbContentService
    var fbContentService = this;

    var options = {
        limit: this.resultsPerFetch,
    };

    graph
        .get(((this.nextPage !== undefined) ? (this.nextPage) : (this.fbPage + '/feed/')), options, function(err, res) {
            // TOM: Will need a better way to handle errors. Stay tuned. See issue #1120.
            if (err) {
                console.error(err);
            }
            // TOM: This comment and the next one don't really add anything. Only comment stuff that is not obvious,
            // AND can't be made obvious by using better variable/method naming.
            //messages array
            messagesOnFeed = [];

            //comments array
            commentsOnPost = [];

            //length of array
            var responseLength = res.data.length;

            // TOM: What if res.data is not totally full (i.e. less than resultsPerFetch entries?)
            // TOM: This whole piece of logic can also be moved into a private method (this method is quite huge as it is).
            var fetchPrevPage = (new Date(res.data[fbContentService.resultsPerFetch - 1].created_time) > new Date(fbContentService.lastCrawlDate));

            // TOM: Please use the same comment style as in TwitterContentService (space after //, capital letter)
            // TOM: Nice thinking to go in reverse order!
            //load the next batch of issues
            for (var i = responseLength - 1; i >= 0; i--) {

                // TOM: Why not just call these 'data' and 'comments'?
                var postHasData = res.data[i];
                var postHasComments = (res.data[i].comments);

                // TOM: Do you really need to build date objects here? The string date that FB returns should be lexically comparable.
                // TOM: Be careful with create_time vs. updated_time (or whatever it's called). I believe these things are sorted
                // by upated_time, b/c that changes when comments get added.
                //check if date is valid for each post
                var validDate = (new Date(res.data[i].created_time) > new Date(fbContentService.lastCrawlDate));

                // TOM: I don't really understand what happens after this point. We should setup a meeting to chat.

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