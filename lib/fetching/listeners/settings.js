// Registers listeners for Aggie settings events

const downstream = require('../downstream');
const childProcess = require('../../child-process');

function registerListeners() {
    const emitter = childProcess.setupEventProxy({
        emitter: '/lib/api/v1/settings-controller',
        emitterModule: 'api'
    });
    emitter.on('fetching:start', onFetchingStart);
    emitter.on('fetching:stop', onFetchingStop);
}

// fetching:start
async function onFetchingStart() {
    await downstream.start();
}

// fetching:stop
async function onFetchingStop() {
    await downstream.stop();
}

module.exports = registerListeners;
