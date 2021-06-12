// Registers listeners for Aggie Source events

const childProcess = require('../../child-process');

const {
    hasChannel,
    stopChannel,
    deleteChannel,
    createChannel,
    startChannel,
    fetchSourceByID,
} = require('../sourceToChannel');

function registerListeners() {
    const emitter = childProcess.setupEventProxy({
        emitter: '/models/source',
        subclass: 'schema',
        emitterModule: 'api'
    })
    emitter.on('source:save', onSourceSave);
    emitter.on('source:remove', onSourceRemove);
    emitter.on('source:enable', onSourceEnable);
    emitter.on('source:disable', onSourceDisable);
}

// source:save
async function onSourceSave(src) {
    const source = await fetchSourceByID(src);

    if (hasChannel(source)) {
        await stopChannel(source);
        deleteChannel(source);
    }
    createChannel(source);
    await startChannel(source);
}

// source:remove
async function onSourceRemove(source) {
    if (hasChannel(source)) {
        await stopChannel(source);
        deleteChannel(source);
    }
}

// source:enable
async function onSourceEnable(source) {
    await startChannel(source);
}

// source:disable
async function onSourceDisable(source) {
    await stopChannel(source);
}

module.exports = registerListeners;
