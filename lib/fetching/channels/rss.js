const { PageChannel } = require('downstream');
const FeedParser = require('feedparser');
const sanitizeHTML = require('sanitize-html');
const request = require('request');
const hash = require('../../hash');

/**
 * A Channel that fetches posts from an RSS feed.
 */
class RSSChannel extends PageChannel {
    constructor(options) {
        super({
            ...options,
            namespace: options.namespace || `rss-${hash(options.url)}`,
        });

        
        if (!options.url) {
            throw new Error('The `url` field is required.');
        }

        // initialize RSSChannel variables
        this.url = options.url;
        this.interval = options.interval || this.interval;
    }

    fetchPage() {
        return new Promise((resolve, reject) => {
            let posts;
            const self = this;
            const feedparser = new FeedParser();
            this.doRequest()
                .then(({ res, stream }) => {
                    if (res.statusCode !== 200) {
                        return reject(new Error.HTTP(res.statusCode));
                    }

                    stream.pipe(feedparser);

                    // Handle feedparser errors.
                    feedparser.on('error', (err) => {
                        return reject(new Error('Parse error: ' + err.message));
                    });

                     // Each time feedparser returns a readable, add it to the array (if it's new).
                    feedparser.on('readable', function() {
                        let data;

                        // Read and parse stream data
                        while (null !== (data = this.read())) {
                            const post = self.parse(data);

                            // Validate, make sure it's new
                            if (self.validate(post) && self.isNew(post)) {
                                posts.push(data);
                            }
                        }
                    });

                     // When feedparser says it's done, call callback
                    feedparser.on('end', (err) => {
                        if (err) {
                            return reject(err);
                        }

                        resolve(posts);
                    });

                })
                .catch((err) => {
                    reject(new Error('HTTP error:' + err.message));
                });
        });
    }

    // Makes request to RSS feed. Returns a stream object.
    doRequest() {
        return new Promise((resolve, reject) => {
            const req = request(this.url);

            req.on('error', (err) => {
                reject(err);
            });

            req.on('response', function (res) {
                resolve({
                    res,
                    stream: this,
                });
            });
        });
    }

    // Validate post data
    validate(post) {
       if (!post.authoredAt || !post.content) {
           return false;
       }
       return true;
    }

    // Determine whether to skip or include a report based on its authored date
    isNew(post) {
        return !this.lastTimestamp || post.authoredAt > this.lastTimestamp;
    }

    parse(data) {
        const content = data.title ? '[' + data.title + '] ' : '';
        content += data.description ? sanitizeHTML(data.description) : '';

        const now = new Date();
        const authoredAt = new Date(data.date);
        const author = data.author;
        const url = data.link;

        return {
            authoredAt,
            fetchedAt: now,
            content,
            author,
            url,
            platform: 'rss',
            raw: data,
        }
    }

}

module.exports = RSSChannel;
