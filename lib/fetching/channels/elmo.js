const { PageChannel } = require('downstream');
const moment = require('moment');
const request = require('request');
const hash = require('../../hash');

/**
 * A Channel that fetches data from an instance of ELMO, a field data gathering system.
 */
class ELMOChannel extends PageChannel {

    constructor(options) {
        super({
            ...options,
            namespace: options.namespace || `elmo-${hash(options.authToken)}`,
        });
      
        if (!options.authToken) {
            throw new Error('The `authToken` field is required.');
        }

        if (!options.url) {
            throw new Error('The `url` field is required.');
        }

        // initialize ELMOChannel variables
        this.authToken = options.authToken;
        this.url = options.url;
        this.interval = options.interval || this.interval;
    }

    async fetchPage() {
        let posts;

        // Do the request. We just fetch one page at this time. If there is more data, we will fetch it next time.
        // Assumes the responses will be returned in chronological order, newest to oldest.
        let res;
        let body;
        try {
            const { r, b } = await this.sendHTTPRequest({
                url: this.getURLWithDate(),
                headers: {
                    Authorization: 'Token token=' + this.authToken,
                },
            });
            res = r;
            body = b;
        } catch (err) {
            throw new Error('HTTP error:' + err.message);
        }

        if (res.statusCode !== 200) {
            throw new Error.HTTP(res.statusCode);
        }

        // Parse JSON.
        let responses = [];
        try {
            responses = JSON.parse(body);
        } catch (err) {
            throw new Error('Parse error: ' + err.message);
        }

        if (!(responses instanceof Array)) {
            throw new Error('Wrong data');
        }

        // Need to reverse because we want oldest to newest.
        responses = responses.reverse();

        // Parse response data and return them.
        posts = responses.map((response) => {
            return this.parse(response);
        });

        return posts;
    }

    sendHTTPRequest(params) {
        return new Promise((resolve, reject) => {
            request(params, (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ res, body });
                }
            });
        });
    }

    parse(response) {
        const content = response.answers
            .map((answer) => {
                return '[' + answer.code + ': ' + answer.answer + ']';
            })
            .join(' ');

        const now = new Date();
        const authoredAt = new Date(response.created_at);
        const url = this._baseUrl() + 'responses/' + response.id;
        const author = response.submitter;

        return {
            authoredAt,
            fetchedAt: now,
            author,
            content,
            url,
            platform: 'elmo',
            // TODO: platformID
            raw: response,
        };
    }

    // Extracts the base URL from the source URL.
    // e.g. http://example.com/api/v1/m/nepaltestmission/responses.json?form_id=99
    // becomes http://example.com/api/v1/m/nepaltestmission/
    getBaseURL() {
        return this.url.match(/https?:.+\//)[0].replace('api/v1', 'en');
    }

    // Gets the ELMO URL with the date constraint applied.
    getURLWithDate() {
        return this.url + (this.lastTimestamp ? '&created_after=' + moment.utc(this.lastTimestamp).format('YYYYMMDDHHmmss') : '');
    }

}

module.exports = ELMOChannel;