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
        this.bot = new TelegramBot(options.botAPIToken);
    }

    /**
     * Starts the TelegramBot.
     */
    async start() {
        await super.start();

        // start polling the Telegram API
        this.bot.on('message', this.telegramMessageListener);
        this.bot.startPolling();
    }

    /**
     * Stops the TelegramBot.
     */
    async stop() {
        this.bot.removeListener('message', this.telegramMessageListener);
        this.bot.stopPolling();

        await super.stop();
    }

    onTelegramMessage(message) {
        try {
            const item = this.parse(message);
            this.enqueue(item);
        } catch (err) {
            this.emit('error', err);
        }
    }

    /**
     * Parse the given raw message into a SocialMediaPost.
     */
    parse(rawMessage) {
        const now = new Date();
        const firstName = rawMessage.from.first_name ? rawMessage.from.first_name : '';
        const lastName = rawMessage.from.last_name ? rawMessage.from.last_name : '';
        const author = `${firstName} ${lastName}`;
        const authoredAt = new Date(rawMessage.date * 1000).toLocaleString("en-US");
        const content = rawMessage.text;
        const url = "https://t.me/" + rawMessage.chat.username;

        return {
            authoredAt,
            fetchedAt: now,
            author,
            content,
            url,
            platform: "telegram",
            // TODO platformID,
            // TODO group chat
            raw: rawMessage,
        }
    }

}

module.exports = TelegramChannel;