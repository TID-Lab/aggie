var request = require('request');
var ContentService = require('../content-service');
var util = require('util');
var logger = require('../../logger');
var Report = require('../../../models/report');
var config = require('../../../config/secrets');
var { completeUrl, authenticate, getJWTToken } = require('../../comments');
const { time } = require('console');

var CommentContentService = function(options) {
    this.fetchType = 'pull';
    this.interval = 10000;

    const  { count, lastFetchDate, lastAuthoredDate } = config.get().comments;
    this._count = count;
    if (lastFetchDate) {
        this._lastFetchDate = new Date(lastFetchDate);
        this._lastAuthoredDate = new Date(lastAuthoredDate);
    }

    ContentService.call(this, options)
}

CommentContentService.prototype._doFetch = function(_, callback) {
    const commentUrl = completeUrl('comment');
    const options = {
        body: {
            count: this._count
        },
        json: true
    };

    if (this._lastFetchDate && this._lastAuthoredDate) {
        options.body = {
            ...options.body,
            acqAfter: this._lastFetchDate.getTime(),
            authAfter: this._lastAuthoredDate.getTime(),
        }
    }

    this._sendRequest(commentUrl, options, callback);
}

CommentContentService.prototype._sendRequest = function(url, opts, callback) {
    if (typeof getJWTToken() !== 'string') {
        authenticate((err) => {
            if (err) {
                this.emit('error', err);
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
            this.emit('error', new Error('HTTP error: ' + err.message));
            return callback([]);
        } else if (res.statusCode === 401) {
            jwtToken = null;
            this._sendRequest(url, opts, callback);
            return;
        } else if (res.statusCode !== 200) {
            this.emit('error', new Error.HTTP(res.statusCode));
            return callback([]);
        }

        var comments = body;
        try {
            if (typeof comments === 'string') {
                comments = JSON.parse(comments);
            }
            if (!Array.isArray(comments)) {
                this.emit('error', new Error('Wrong data'));
                return callback([]);
            }
        } catch (e) {
            this.emit('error', new Error('Parse error: ' + e.message));
            return callback([]);
        }

        var remaining = comments.length;
        var reports = [];

        const { acquiredAt, timestamp } = comments[comments.length - 1];
        const lastFetchDate = new Date(acquiredAt);
        const lastAuthoredDate = new Date(timestamp);

        console.log('------------------------------');
        console.log('Before');
        console.log(`acquiredAt: ${this._lastFetchDate}`);
        console.log(`timestamp: ${this._lastAuthoredDate}`);
        console.log('------------------------------');
        console.log('After');
        console.log(`# comments: ${comments.length}`);
        console.log(`acquiredAt: ${acquiredAt}`);
        console.log(`timestamp: ${timestamp}`);
        console.log('------------------------------');

        if (comments.length === 0) {
            return callback([]);
        }

        this.cache = {};

        // TODO rewrite with async/await to avoid callback hell
        comments.forEach((doc) => {
            this._parse(doc, (report) => {
                reports.push(report);
                if (--remaining === 0) {
                    console.log('~~~ Point A');
                    config.update(
                        'comments:lastFetchDate',
                        lastFetchDate,
                        (err) => {
                            if (err) {
                                logger.error(err);
                            }
                            console.log('~~~ Point B');
                            config.update(
                                'comments:lastAuthoredDate',
                                lastAuthoredDate,
                                (err) => {
                                    console.log('~~~ Point C');
                                    if (err) {
                                        logger.error(err);
                                    }
                                    this._lastFetchDate = lastFetchDate;
                                    this._lastAuthoredDate = lastAuthoredDate;
                                    console.log('~~~ Point D');
                                    callback(reports);
                                }
                            );
                        }
                    );
                }
            });
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
