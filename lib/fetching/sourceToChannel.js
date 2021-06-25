/**
 * A set of helpful utility functions for converting
 * between Aggie Sources and Downstream Channels.
 */

const { builtin } = require('downstream');
const Source = require('../../models/source');
const _ = require('../../models/credentials'); // registers the Credentials schema
const downstream = require('./downstream');
var config = require('../../config/secrets'); // temporary

const AggieCrowdTangleChannel = require('./channels/crowdtangle');
const { TwitterPageChannel } = builtin;


// Key: Source ID; Value: Channel ID
const sourceChannelJoin = {};

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
 * Stops the Channel corresponding to the given Source.
 */
async function stopChannel(source) {
    const { _id: sourceID } = source;
    const channelID = sourceChannelJoin[sourceID];
    const channel = downstream.channel(channelID);
    await channel.stop();
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
        tags
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
        default:
    }

    channel.tags = source.tags; // store the Source's tags in the Channel object for later

    const channelID = downstream.register(channel);
    sourceChannelJoin[_id] = channelID;
}

/**
 * Starts the Channel corresponding to the given Source.
 */
async function startChannel(source) {
    const { _id: sourceID } = source;
    const channelID = sourceChannelJoin[sourceID];
    const channel = downstream.channel(channelID);
    await channel.start();
}

/**
 * Creates a Channel for each Source, starting
 * all Channels with an enabled Source.
 */
async function initChannels() {
    const sources = await Source
        .find({})
        .populate({ path: 'credentials' })
        .exec();

    // create & start all enabled Channels
    sources
        .filter((source) => source.enabled)
        .forEach((source) => {
            createChannel(source);
        });
    await downstream.start();

    // create, but do not start disabled Channels
    sources
        .filter((source) => !source.enabled)
        .forEach((source) => createChannel(source));
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
    stopChannel,
    deleteChannel,
    createChannel,
    startChannel,
    fetchSourceByID,
    getSourceID,
    getChannel,
}