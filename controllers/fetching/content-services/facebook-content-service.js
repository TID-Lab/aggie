var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
var FBTest = require('./facebook-dummy-content-service');
var graph = require('fbgraph');
var util = require('util');
var async = require('async');

/* 
  Facebook Content Service constructor
  @param options - (lastCrawlDate - Date(optional), resultsPerFetch: String(optional),  fbPage:String(required))
*/
var FacebookContentService = function(options) {

    graph.setAccessToken(config.accessToken);
    if (options.test) {
        var fbTest = new FBTest();
        fbTest.start();
        a.on('report', function(report_data) {
            this.emit('report', this.parse(report_data));
        });
    }

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

    this._isStreaming = false;
    ContentService.call(this, options);

};

util.inherits(FacebookContentService, ContentService);

FacebookContentService.prototype.itemCheck = function(entry) {
    var self = this;
    var data = entry;
    
    var comments = entry.comments.comment_list;

    var validDate = entry.updated_time < self.lastCrawlDate;

    if (data && validDate) {
        self.emit('report', self.parse(data));
    }
    if (comments && validDate) {
        for (var i = 0; i < comments.count; i++) {
            var emitNewComment = comments.data[i] < self.updated_time;

            if (emitNewComment) {
                self.emit('report', self.parse(comments.data[i]));
            }
        }
    }
};


FacebookContentService.prototype.fetch = function() {

    var self = this;
    var query = "SELECT post_id, updated_time, message, comments FROM stream WHERE (source_id=" + self.fbPage + " AND updated_time<" + self.lastCrawlDate + ") ORDER BY updated_time";
    graph
        .fql(query, function(err, res) {
            // TODO: TOM: Will need a better way to handle errors. Stay tuned. See issue #1120.
            if (err) {
                console.error(err);
            }
            var responseLength = res.data.length;
            console.log(responseLength);
            // Check if valid entry length
            if (responseLength > 0) {

                // Loop through and return them item by item
                for (var i = 0; i < responseLength; i++) {
                    self.itemCheck(res.data[i]);
                }
            }
        });

};

FacebookContentService.prototype.parse = function(data) {
    var report_data = {
        fetchedAt: Date.now(),
        authoredAt: data.updated_time || data.time,
        createdAt: data.updated_time || data.time,
        content: data.message || data.text,
        id: data.post_id || data.id,
        author: 'TODO author',
        url: 'TODO url'
    };
    return report_data;
};

module.exports = FacebookContentService;