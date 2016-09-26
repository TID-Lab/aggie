// Sets up the fetching module process and necessary event proxies.
'use strict';

process.title = 'aggie-fetching';

// This file will initialize any necessary components for the operation of the
// fetching module, along with determining event proxies for communication
// between this and other modules.

var childProcess = require('./child-process');
var logger = require('./logger');

// Extend global error class
require('./error');

// Initialize Bot Master and add event proxies
var botMaster = require('./fetching/bot-master');
botMaster.init(function() {
  botMaster.addListeners('source', childProcess.setupEventProxy({
    emitter: '/models/source',
    subclass: 'schema',
    emitterModule: 'api'
  }));
  // The below commented code is the change suggested in PR 172.
  /*
  botMaster.addListeners('source', childProcess.setupEventProxy({
    emitter: '/models/source',
    subclass: 'schema',
    emitterModule: 'fetching'
  }));
  */
  botMaster.addListeners('fetching', childProcess.setupEventProxy({
    emitter: '/lib/api/v1/settings-controller',
    emitterModule: 'api'
  }));
});

// Initialize Report Writer
var reportWriter = require('./fetching/report-writer');

// handle uncaught exceptions
process.on('uncaughtException', function(err) {
  logger.error(err);
});

// Export fetching module itself as a child process
module.exports = childProcess;
module.exports.botMaster = botMaster;
module.exports.reportWriter = reportWriter;
