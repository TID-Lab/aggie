var request = require('request');
var ContentService = require('../content-service');
var util = require('util');
var logger = require('../../logger');
var Report = require('../../../models/report');
var config = require('../../../config/secrets');
var { completeUrl, authenticate, getJWTToken } = require('../../comments');

var CommentContentService = function(options) {
    this.fetchType = 'pull';
    this.interval = 10000;
    this._count = config.get().comments.count;

    ContentService.call(this, options)
}

CommentContentService.prototype._doFetch = function(_, callback) {
    const commentUrl = completeUrl('comment');
    const options = {};

    var after = this._lastReportDate ? new Date(this._lastReportDate.getTime() + 1000): new Date();

    options.json = true;
    options.body = {
        after,
        count: this._count,
    };

    this._sendRequest(commentUrl, options, callback);
}

CommentContentService.prototype._sendRequest = function(url, opts, callback) {
    var self = this;
    if (typeof getJWTToken() !== 'string') {
        authenticate((err) => {
            if (err) {
                self.emit('error', err);
                return callback([]);
            }
            this._sendRequest(url, opts, callback);
        });
        return;
    }

    opts.auth = {
        bearer: getJWTToken(),
    }
    request(url, opts, (err, res, body) => {
        if (err) {
            self.emit('error', new Error('HTTP error: ' + err.message));
            return callback([]);
        } else if (res.statusCode === 401) {
            jwtToken = null;
            this._sendRequest(url, opts, callback);
        } else if (res.statusCode !== 200) {
            self.emit('error', new Error.HTTP(res.statusCode));
            return callback([]);
        }

        var comments = body;
        try {
            if (typeof comments === 'string') {
                comments = JSON.parse(comments);
            }
            if (!Array.isArray(comments)) {
                self.emit('error', new Error('Wrong data'));
                return callback([]);
            }
        } catch (e) {
            self.emit('error', new Error('Parse error: ' + e.message));
            return callback([]);
        }

        var remaining = comments.length;
        var reports = [];

        if (comments.length === 0) {
            return callback([]);
        }

        this.cache = {};
        comments.forEach((doc) => {
            self._parse.bind(self, doc, (report) => {
                reports.push(report);
                if (--remaining === 0) {
                    return callback(reports);
                }
            })();
        });
    });
}

CommentContentService.prototype._parse = function(doc, callback) {

    var metadata = {}
    if (typeof doc.media === 'object') {
        const ext = doc.media.ext;
        const type = (doc.media.ext === 'mp4') ? 'video' : 'photo';
        const mediaUrl = completeUrl(`static/${doc._id}.${ext}`);
        metadata.mediaUrl = [{ type, mediaUrl }];
    }
    var content = doc.text || 'No Content';
    var { post: postUrl, url } = doc;

    const report = {
        authoredAt: new Date(doc.timestamp),
        fetchedAt: new Date(),
        content,
        url,
        metadata,
    }

    const post = this.cache[postUrl];
    if (!post) {
        Report.findOne({ url: postUrl }, (err, doc) => {
            if (err) {
                logger.error(err);
            }
            const { _id, content } = doc;
            report.commentTo = _id;
            report.originalPost = content;
            this.cache[postUrl] = { _id, content };
            callback(report);
        });
    } else {
        const { _id, content } = post;
        report.commentTo = _id;
        report.originalPost = content;
        callback(report);
    }
}

util.inherits(CommentContentService, ContentService);

module.exports = CommentContentService;
