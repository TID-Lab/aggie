var request = require('request');
var ContentService = require('../content-service');
var util = require('util');
var { URL, resolve } = require('url');
var logger = require('../../logger');
var config = require('../../../config/secrets');
var { completeUrl, authenticate, getJWTToken } = require('../../comments');

var CommentContentService = function(options) {
    this.fetchType = 'pull';
    this.interval = 10000;

    ContentService.call(this, options)
}

CommentContentService.prototype._doFetch = function(_, callback) {
    const commentUrl = completeUrl('comment');
    const options = {};

    if (this._lastFetched) {
        options.json = true;
        options.body = {
            after: this._lastFetched.getTime(),
        }
    }

    this._sendRequest(commentUrl, options, callback);
    this._lastFetched = new Date();
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

        callback(comments.map((doc) => self._parse(doc)));
    });
}

CommentContentService.prototype._parse = function(doc) {
    var metadata = {}
    if (typeof doc.media === 'object') {
        const ext = doc.media.ext;
        const type = (doc.media.ext === 'mp4') ? 'video' : 'photo';
        const url = `${this._baseUrl}/static/${doc._id}.${ext}`;
        metadata.mediaUrl = [{ type, url }];
    }
 
    var content = doc.text || 'No Content';

    return {
        authoredAt: new Date(doc.timestamp),
        fetchedAt: new Date(),
        content: content,
        url: doc.url,
        metadata: metadata,
    }
}

util.inherits(CommentContentService, ContentService);

module.exports = CommentContentService;
