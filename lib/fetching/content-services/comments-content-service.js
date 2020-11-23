var request = require('request');
var ContentService = require('../content-service');
var util = require('util');
var logger = require('../../logger');
var Report = require('../../../models/report');
var config = require('../../../config/secrets');
var { completeUrl, authenticate, getJWTToken, setJWTToken } = require('../../comments');
var Promise = require('promise');

var CommentContentService = function(options) {
    this.fetchType = 'pull';
    this.interval = 10000;

    const  { pageCount, lastFetchDate, lastAuthoredDate } = config.get().comments;
    this.detectHateSpeech = config.get().detectHateSpeech;
    this._pageCount = pageCount;
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
            count: this._pageCount
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
            setJWTToken(null);
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

        if (comments.length === 0) {
            return callback([]);
        }

        this.cache = {};

        const { acquiredAt, timestamp } = comments[comments.length - 1];
        const lastFetchDate = new Date(acquiredAt);
        const lastAuthoredDate = new Date(timestamp);
        var hateSpeechRequests = [];
        comments.forEach((doc) => {
            this._parse(doc, (report) => {
                reports.push(report);
                if (this.detectHateSpeech){
                    hateSpeechRequests.push({"data" : report, "request" :ContentService.prototype.getHateSpeechRequest(report.content != 'No Content'? report.content : "")});
                }
                if (--remaining === 0) {
                    if (this.detectHateSpeech){
                        Promise.all(hateSpeechRequests.map(function(x){return x.request})).then(
                            function(hateSpeechResults){
                                hateSpeechResults.forEach((hateSpeechResult, index)=>{
                                    hateSpeechRequests[index].data.metadata.hateSpeechScore = hateSpeechResult.result.hateSpeechScore;
                                });
                                return hateSpeechRequests;
                            }
                        ).then((hateSpeechRequests) => {
                            this._savePage(lastAuthoredDate, lastFetchDate).then(() => {
                                callback(hateSpeechRequests.map((x) => x.data));
                            });
                        });
                    } else {
                        this._savePage(lastAuthoredDate, lastFetchDate).then(() => {
                            callback(reports);
                        });
                    }
                }
            });
        });
    });
}

/**
 * Wraps the config.update method in a Promise so calls can be chained together
 * @param {String} key The config key being updated
 * @param {*} value The value to save
 */
CommentContentService.prototype._updateConfig = function(key, value) {
    return new Promise((resolve, reject) => {
        config.update(key, value, (err) => {
            if (err) return reject(err);
            resolve();
        })
    });
}

CommentContentService.prototype._savePage = async function(lastAuthoredDate, lastFetchDate) {
    try {
        await this._updateConfig('comments:lastFetchDate', lastFetchDate);
        await this._updateConfig('comments:lastAuthoredDate', lastAuthoredDate);
        this._lastFetchDate = lastFetchDate;
        this._lastAuthoredDate = lastAuthoredDate;
    } catch (err) {
        logger.error(error);
    } finally {
        this._lastFetchDate = lastFetchDate;
        this._lastAuthoredDate = lastAuthoredDate;
    }
}

async function createSkeletonReport(url) {
    const now = new Date();
    const repDoc = new Report({
        "tags": [],
        "smtcTags": ["5fa5e64440eaa550a87694c8"],
        "read": false,
        "flagged": false,
        "_sources": ["5fa5c7dc646ebd3cb4b738ef"],
        "_media": ["crowdtangle"],
        "_sourceNicknames": ["Facebook"],
        "authoredAt": new Date(0),
        "fetchedAt": now,
        "content": "[Missing] Click URL for original post content.",
        "author": "N/A",
        "metadata": {},
        "ct_tag": ["N/A"],
        url,
        storedAt: now,
    });
    const rep = await repDoc.save();
    return rep;
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

    // TODO this memoization is a premature optimization. Remove!
    const post = this.cache[postUrl];
    if (!post) {
        Report.findOne({ url: postUrl }, (err, rep) => {
            if (err) {
                logger.error(err);
            }
            const next = (doc) => {
                const { _id, content } = doc;
                report.commentTo = _id;
                report.originalPost = content;
                this.cache[postUrl] = { _id, content };
                callback(report);
            }
            if (doc == null) {
                createSkeletonReport(postUrl).then((r) => {
                    next(r)
                });
            } else {
                next(rep);
            }
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
