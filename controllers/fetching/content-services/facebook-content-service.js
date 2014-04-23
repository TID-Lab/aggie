var config = require('../../../config/secrets').facebook;
var ContentService = require('../content-service');
// var FBTest = require('./facebook-dummy-content-service');
var graph = require('fbgraph');
var util = require('util');

/* 
Facebook Content Service constructor
@param options - (lastCrawlDate - Date(optional), resultsPerFetch: String(optional),  fbPage:String(required))
*/
var FacebookContentService = function(options) {

    graph.setAccessToken(config.accessToken);
    // if (options.test) {
    //     var fbTest = new FBTest();
    //     fbTest.start();
    //     a.on('report', function(report_data) {
    //         this.emit('report', this._parse(report_data));
    //     });
    // }

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

    this.sourceType = 'facebook';
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
        // TODO: TOM: Will need a better way to handle errors. Stay tuned. See issue #1120.
        if (err) {
            console.error(err);
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
        fetchedAt: Date.now(),
        authoredAt: (isPost) ? data.updated_time : data.time,
        createdAt: (isPost) ? data.updated_time : data.time,
        content: (isPost) ? data.message : data.text,
        id: (isPost) ? data.post_id : data.id,
        author: (isPost) ? data.actor_id : data.fromid,
        url: (isPost) ? data.permalink : 'todourlforcomment'
    };
    return report_data;
};

module.exports = FacebookContentService;