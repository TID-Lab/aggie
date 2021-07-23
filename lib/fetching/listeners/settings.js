// Registers listeners for Aggie settings events

const downstream = require('../downstream');
const childProcess = require('../../child-process');
const config = require('../../../config/secrets');

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
    await downstream.start((_, channel) => channel.enabled);
}

// fetching:stop
async function onFetchingStop() {
    await downstream.stop((_, channel) => channel.enabled);
}

// settingsUpdated
function onSettingsUpdated() {
    config.get({ reload: true });
}

module.exports = registerListeners;
