const { WebChannel } = require('downstream');

/**
 * A Channel that receives SMS messages via a web server.
 * 
 * Note: This Channel was copied from the old SMSGH content service.
 * If that content service contained bugs, then this Channel does too.
 */
class SMSGhChannel extends WebChannel {

    constructor(options) {
        super({
            ...options,
            path: options.keywords, // must be a URL-safe string
        });
    }

    parse(bodyBuffer) {
        const json = JSON.parse(bodyBuffer.toString());

        const now = new Date();
        const authoredAt = new Date(json.date || now);
        const url = '';
        const author = json.from || 'anonymous';
        const content = json.fulltext || '-NO TEXT-';

        return {
            authoredAt,
            fetchedAt: now,
            url,
            author,
            platform: 'smsgh',
            content,
        }
    }
}

WebChannel.PORT = 4000;

module.exports = SMSGhChannel;