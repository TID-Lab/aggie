const { Channel } = require('downstream');
const TelegramBot = require('node-telegram-bot-api');

/**
 * A Channel that polls the Telegram API for messages sent to a Telegram bot.
 */
class TelegramChannel extends Channel {

    constructor(options) {
        super(options);

        if (!options.botAPIToken) {
            throw new Error('The `botAPIToken` field is required.');
        }

        // initialize TelegramChannel variables
        this.telegramMessageListener = this.onTelegramMessage.bind(this);
        this.telegramErrorListener = this.onTelegramError.bind(this);
        this.bot = new TelegramBot(options.botAPIToken);
    }

    /**
     * Starts the TelegramBot.
     */
    async start() {
        await super.start();

        // start polling the Telegram Bot API

        this.bot.on('message', this.telegramMessageListener);
        this.bot.on('channel_post', this.telegramMessageListener);

        
        this.bot.on('error', this.telegramErrorListener);
        this.bot.on('polling_error', this.telegramErrorListener);
        this.bot.on('webhook_error', this.telegramErrorListener);

        this.bot.startPolling();
    }

    /**
     * Stops the TelegramBot.
     */
    async stop() {
        // stop polling the Telegram Bot API

        this.bot.removeListener('message', this.telegramMessageListener);
        this.bot.removeListener('channel_post', this.telegramMessageListener);

        this.bot.removeListener('error', this.telegramErrorListener);
        this.bot.removeListener('polling_error', this.telegramErrorListener);
        this.bot.removeListener('webhook_error', this.telegramErrorListener);

        this.bot.stopPolling();

        await super.stop();
    }

    onTelegramMessage(message) {
        const item = this.parse(message);
        this.enqueue(item);
    }

    onTelegramError(err) {
        if (err.response) {
            switch (err.response.code) {
                case 'EPARSE':
                    err.message = err.response.body;
                    break;
                case 'ETELEGRAM':
                    err.message = err.response.body.description;
                    break;
                default:
            }
        }
        this.emit('error', err);
    }

    /**
     * Parse the given raw message into a SocialMediaPost.
     */
    parse(rawMessage) {
        // See reference: https://core.telegram.org/bots/api#message

        // Temporary: ignore all messages that are not text b/c multimedia parsing is complicated
        if (!rawMessage.text) return;

        const now = new Date();
        let author;
        if (rawMessage.chat.type == 'channel') {
            author = rawMessage.chat.title;
        } else if (rawMessage.chat.type === 'group') {
            const firstName = rawMessage.from.first_name ? rawMessage.from.first_name : '';
            const lastName = rawMessage.from.last_name ? rawMessage.from.last_name : '';
            author = `${firstName} ${lastName}`;
        }
        const authoredAt = new Date(rawMessage.date * 1000).toLocaleString("en-US");
        const content = rawMessage.text;
        let url = '';
        if (rawMessage.chat.type === 'channel') {
            url = "https://t.me/" + rawMessage.chat.username;
        }
        const platformID = rawMessage.message_id;

        return {
            authoredAt,
            fetchedAt: now,
            author,
            content,
            url,
            platform: "telegram",
            platformID,
            raw: rawMessage,
        }
    }

}

module.exports = TelegramChannel;