var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var fbDumb = require('./facebook-dummy-content-service');
var graph = require('fbgraph');
var util = require('util');
var async = require('async');

/* 
  Facebook Content Service constructor
  @param options - (lastCrawlDate - Date(optional), resultsPerFetch: String(optional),  fbPage:String(required))
*/
var FacebookContentService = function(options) {

    graph.setAccessToken(config.accessToken);
    var a = new fbDumb();
    a.start();
    var self = this;
    a.on('report', function(report_data) {
        self.parse(report_data);
    });
    this.lastCrawlDate = options.lastCrawlDate || Math.round(Date.now() / 1000);


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
    this._isBusy = false;
    ContentService.call(this, options);

};

util.inherits(FacebookContentService, ContentService);

FacebookContentService.prototype.fetch = function() {


    function itemCheck(self, entry) {

        var data = entry;
        var comments = entry.comments;

        var validDate = entry.updated_time > self.lastCrawlDate;

        if (data && validDate) {
            self.emit('report', self.parse(data));
        }
        if (comments && validDate) {
            // self.emit(comments.data[0]);
        }

    }

    var self = this;

    var query = "SELECT post_id, updated_time, message, comments FROM stream WHERE (source_id=" + self.fbPage + " AND updated_time<" + self.lastCrawlDate + ") ORDER BY updated_time LIMIT " + this.resultsPerFetch;
    graph
        .fql(query, function(err, res) {
            // TODO: TOM: Will need a better way to handle errors. Stay tuned. See issue #1120.
            if (err) {
                console.error(err);
            }

            //console.log(res.data[0].comments);
            var responseLength = res.data.length;

            // Check the last item to see if 
            if (responseLength > 0) {

                //Check if we need to fetch the p
                var fetchPrevPage = res.data[0].updated_time > self.lastCrawlDate;

                if (fetchPrevPage && !self._isBusy) {
                    self.lastCrawlDate = Date.now();
                    self._isBusy = true;
                    // console.log(self.lastCrawlDate);
                    // console.log(self._isBusy);

                }

                // Load the next batch of issues
                for (var i = 0; i < responseLength; i++) {

                    itemCheck(self, res.data[i]);

                }


            }



            //     async.parallel([
            //             function(callback) {
            //                 var content = self.parse(messagesOnFeed, commentsOnPost);
            //                 this.lastCrawlDate = new Date();
            //                 callback(null, 'content saved');
            //                 return content;
            //             },
            //             function(callback) {
            //                 var status = 'No new page fetched';
            //                 if (fetchPrevPage) {
            //                     this.lastCrawlDate = new Date();
            //                     status = 'New page fetched';
            //                     self.fetch();
            //                 }
            //                 callback(null, status);
            //             }
            //         ],
            //         function(err, results) {
            //             console.log(results);
            //             return results;

            //         });
        });

};

FacebookContentService.prototype.parse = function(data) {
    var report_data = {
        fetchedAt: Date.now(),
        authoredAt: data.created_time,
        createdAt: data.updated_time,
        content: data.message,
        id : data.post_id,
        author: 'TODO author',
        url: 'TODO url'
    };
    console.log(report_data);
    return report_data;
};

module.exports = FacebookContentService;