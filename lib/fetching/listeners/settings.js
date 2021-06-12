// Registers listeners for Aggie settings events

const downstream = require('../downstream');
const config = require('../../../config/secrets');
const childProcess = require('../../child-process');

function registerListeners() {
    const emitter = childProcess.setupEventProxy({
        emitter: '/lib/api/v1/settings-controller',
        emitterModule: 'api'
    });
    emitter.on('fetching:start', onFetchingStart);
    emitter.on('fetching:stop', onFetchingStop);
    emitter.on('settingsUpdated', onSettingsUpdated);
}

// fetching:start
async function onFetchingStart() {
    await downstream.start();
}

// fetching:stop
async function onFetchingStop() {
    await downstream.stop();
}

// settingsUpdated
function onSettingsUpdated(data) {
    config.get({ reload: true });
    // TODO trigger reload of config settings
}

module.exports = registerListeners;
