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
    this._isStreaming = false;
};

FacebookContentService.prototype.setCrawlDate = function(crawlDate) {
    this.lastCrawlDate = crawlDate;
};

FacebookContentService.prototype.fetch = function() {

    //This will need to be changed into an array 
    commentsOnPost = '';

    graph
        .get(this.fbPage + '/feed/', {
            limit: 100,
            since: this.lastCrawlDate
        }, function(err, res) {

            console.log(err);
            console.log(res);

            async.parallel([
                function(callback) {
                    request("http://google.jp", function(err, response, body) {
                        if (err) {
                            console.log(err);
                            callback(true);
                            return;
                        }
                        console.log("function: 1");
                        callback(false);
                    });
                },
                function(callback) {
                    request("http://google.com", function(err, response, body) {
                        if (err) {
                            console.log(err);
                            callback(true);
                            return;
                        }
                        console.log("function: 2");
                        callback(false);
                    });
                }
            ]);
            if (res.paging && res.paging.next) {
                console.log('paging has next');
                graph.get(res.paging.next);
            }

            // for (var i = res['data'].length - 1; i >= 0; i--) {

            //     var postHasComments = (res['data'][i]['comments']);

            //     if (postHasComments) {
            //         commentsOnPost += (postHasComments['data'][0].message);
            //     }
            // }
        });

    console.log(commentsOnPost);

    return commentsOnPost;

};

module.exports = FacebookContentService;