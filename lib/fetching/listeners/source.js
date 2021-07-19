// Registers listeners for Aggie Source events

const childProcess = require('../../child-process');

const {
    hasChannel,
    disableChannel,
    deleteChannel,
    createChannel,
    enableChannel,
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
        await disableChannel(source);
        deleteChannel(source);
    }
    createChannel(source);
    await enableChannel(source);
}

// source:remove
async function onSourceRemove(source) {
    if (hasChannel(source)) {
        await disableChannel(source);
        deleteChannel(source);
    }
}

// source:enable
async function onSourceEnable(source) {
    await enableChannel(source);
}

// source:disable
async function onSourceDisable(source) {
    await disableChannel(source);
}

module.exports = registerListeners;
