'use strict';

/**
 * Sets up the fetching module process and necessary event proxies.
 * 
 * This file will initialize any necessary components for the operation of the
 * fetching module, along with determining event proxies for communication
 * between this and other modules.
 */

process.title = 'aggie-fetching';

const childProcess = require('./child-process');
const downstream = require('./fetching/downstream');
const { initChannels } = require('./fetching/sourceToChannel');

// Import listeners
const registerSettingsListeners = require('./fetching/listeners/settings');
const registerSourceListeners = require('./fetching/listeners/source');
const errorListener = require('./fetching/listeners/error');

// Import hooks
const postToReport = require('./fetching/hooks/postToReport');
const saveToDatabase = require('./fetching/hooks/saveToDatabase');

// Extend global error class
require('./error');

// handle uncaught errors
process.on('uncaughtException', function(err) {
    logger.error(err);
});

// Use hooks
downstream.use(postToReport);
downstream.use(saveToDatabase);

// Register the error listener
downstream.on('error', errorListener);

(async () => {
    await initChannels();

    // register Aggie event listeners
    registerSettingsListeners();
    registerSourceListeners();
})();
module.exports = childProcess;
