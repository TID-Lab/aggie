const logger = require('../../logger');
const { getSourceID, fetchSourceByID } = require('../sourceToChannel');

/**
 * Listens to the Downstream `error` event
 */
module.exports = async function (err, channelID) {
    logger.error(err);

    // If `channelID` is defined then the error came from a Channel 
    if (channelID) {
        const sourceID = getSourceID(channelID);
        const source = await fetchSourceByID({ _id: sourceID });

        await source.logEvent('error', err.message);
    }
}