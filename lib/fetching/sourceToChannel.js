/**
 * A set of helpful utility functions for converting
 * between Aggie Sources and Downstream Channels.
 */

const { builtin } = require('downstream');
const Source = require('../../models/source');
const _ = require('../../models/credentials'); // registers the Credentials schema
const config = require('../../config/secrets');
const downstream = require('./downstream');

const AggieCrowdTangleChannel = require('./channels/crowdtangle');
const TelegramChannel = require('./channels/telegram');
const { TwitterPageChannel } = builtin;


// Key: Source ID; Value: Channel ID
const sourceChannelJoin = {};

/**
 * Returns whether Aggie has fetching enabled or not.
 */
function isFetching() {
    return config.get().fetching;
}

/**
 * Fetches the Source with the given ID from the database,
 * including the Credentials that the Source uses.
 */
async function fetchSourceByID(src) {
    const { _id: sourceID } = src;
    const source = await Source
        .findById(sourceID)
        .populate({ path: 'credentials' })
        .exec();
    return source;
}

/**
 * Returns whether there is a Channel corresponding to the given Source.
 */
function hasChannel(source) {
    const { _id: sourceID } = source;
    const channelID = sourceChannelJoin[sourceID];
    return !!channelID;
}

/**
 * Disables the Channel corresponding to the given Source.
 */
async function disableChannel(source) {
    const { _id: sourceID } = source;
    const channelID = sourceChannelJoin[sourceID];
    const channel = downstream.channel(channelID);

    channel.enabled = false;

    if (isFetching()) {
        await channel.stop();
    }
}

/**
 * Deletes the Channel corresponding to the given Source.
 */
function deleteChannel(source) {
    const { _id: sourceID } = source;
    const channelID = sourceChannelJoin[sourceID];
    downstream.unregister(channelID);
    delete sourceChannelJoin[sourceChannelJoin];
}

/**
 * Creates a new Channel corresponding to the given Source.
 */
function createChannel(source) {
    let channel;

    const {
        _id,
        lastReportDate,
        keywords,
        credentials,
        media,
        tags,
        enabled
    } = source;

    let options = {
        lastTimestamp: lastReportDate,
        onFetch: async (lastTimestamp) => {
            return Source.updateOne(
                { _id },
                { lastReportDate: lastTimestamp },
            ).exec();
        }
    };

    switch(media) {
        case 'facebook':
        case 'instagram':
            options = {
                ...options,
                dashboardToken: credentials.secrets.dashboardAPIToken,
                queryParams: {
                    searchTerm: keywords, // TODO rename to something better
                    platforms: media,
                },
            };
            channel = new AggieCrowdTangleChannel(options);
            break;
        case 'twitter':
            options = {
                ...options,
                credentials: {
                    consumerKey: credentials.secrets.consumerKey,
                    consumerSecret: credentials.secrets.consumerSecret,
                },
                queryParams: {
                    query: keywords // TODO rename to something better
                },
            }
            channel = new TwitterPageChannel(options);
            break;
        case 'telegram':
            options = {
                ...options,
                botAPIToken: credentials.secrets.botAPIToken,
            };
            channel = new TelegramChannel(options);
            break;
        default:
    }

    channel.enabled = enabled;
    channel.tags = tags;

    const channelID = downstream.register(channel);
    sourceChannelJoin[_id] = channelID;
}

/**
 * Enables the Channel corresponding to the given Source.
 */
async function enableChannel(source) {
    const { _id: sourceID } = source;
    const channelID = sourceChannelJoin[sourceID];
    const channel = downstream.channel(channelID);

    channel.enabled = true;

    if (isFetching()) {
        await channel.start();
    }
}

/**
 * Creates a Channel for each Source, starting
 * all Channels with an enabled Source.
 */
async function initChannels() {
    const fetching = isFetching();

    const sources = await Source
        .find({})
        .populate({ path: 'credentials' })
        .exec();

    // create & start all enabled Channels
    sources.forEach((source) => createChannel(source));

    await downstream.start((_, channel) => fetching && channel.enabled);
}

/**
 * Returns the Source ID associated with the given channel ID.
 */
function getSourceID(channelID) {
    return Object.keys(sourceChannelJoin).find(
        (sourceID) => sourceChannelJoin[sourceID] === channelID
    );
}

/**
 * Returns the Channel associated with the given channel ID.
 */
function getChannel(channelID) {
    return downstream.channel(channelID);
}

module.exports = {
    initChannels,
    hasChannel,
    disableChannel,
    deleteChannel,
    createChannel,
    enableChannel,
    fetchSourceByID,
    getSourceID,
    getChannel,
}