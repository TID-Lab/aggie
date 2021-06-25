/**
 * A set of helpful utility functions for converting
 * between Aggie Sources and Downstream Channels.
 */

const { builtin } = require('downstream');
const _ = require('../../models/credentials'); // registers the Credentials schema
const Source = require('../../models/source');
const downstream = require('./downstream');
var config = require('../../config/secrets'); // temporary

const {
    CrowdTangleFacebookChannel,
    CrowdTangleInstagramChannel,
    TwitterPageChannel,
} = builtin;


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
        media
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

    // generates a namespace as a function of the Source media type & credentials
    const namespace = `${media}-${credentials.hashSecrets()}`;

    switch(media) {
        case 'facebook':
        case 'instagram':
            options = {
                ...options,
                dashboardToken: credentials.secrets.dashboardAPIToken,
                queryParams: {
                    // TODO listIds
                    searchTerm: keywords,
                },
                namespace,
            };
            switch(media) {
                case 'facebook':
                    channel = new CrowdTangleFacebookChannel(options);
                    break;
                case 'instagram':
                    channel = new CrowdTangleInstagramChannel(options);
                    break;
            }
            break;
        case 'twitter':
            options = {
                ...options,
                credentials: {
                    consumerKey: credentials.secrets.consumerKey,
                    consumerSecret: credentials.secrets.consumerSecret,
                },
                queryParams: {
                    query: keywords,
                },
                namespace,
            }
            channel = new TwitterPageChannel(options);
            break;
        default:
    }

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

module.exports = {
    initChannels,
    hasChannel,
    stopChannel,
    deleteChannel,
    createChannel,
    startChannel,
    fetchSourceByID,
    getSourceID,
}