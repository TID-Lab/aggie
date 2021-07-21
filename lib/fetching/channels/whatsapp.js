const { WebChannel } = require('downstream');

/**
 * A Channel that receives WhatsApp messages via a web server.
 * 
 * Note: This Channel was copied from the old WhatsApp content service.
 * If that content service contained bugs, then this Channel does too.
 */
class WhatsAppChannel extends WebChannel {

    constructor(options) {
        super({
            ...options,
            path: `whatsapp/${options.keywords}`, // must be a URL-safe string
        });
    }

    parse(bodyBuffer) {
        const json = JSON.parse(bodyBuffer.toString());

        const now = new Date();
        const authoredAt = new Date(json.date || now);
        const url = '';
        const author = json.from || 'anonymous';
        const content = json.text || '-NO TEXT-';

        return {
            authoredAt,
            fetchedAt: now,
            url,
            author,
            platform: 'whatsapp',
            content,
        }
    }
}

WebChannel.PORT = 4000;

module.exports = WhatsAppChannel;