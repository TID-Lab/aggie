// Sets up the analytics process and its event proxies.

process.title = 'aggie-analytics';

// This file will initialize any necessary components for the operation of the
// analytics module, along with determining event proxies for communication
// between this and other modules.

const childProcess = require('./child-process');
const logger = require('./logger');

// Extend global error class
require('./error');

// Initialize Trend Master and add event proxies
//KEEP IN MIND THESE ARE RELATIVE TO THE child-process.js file. TODO: Find a way to do this relatively. These are imported in the child-process.js file
var statsMaster = require('./analytics/stats-master');
statsMaster.addListeners('report', childProcess.setupEventProxy({
  emitter: './models/report',
  subclass: 'schema',
  emitterModule: 'api'
}));
statsMaster.addListeners('group', childProcess.setupEventProxy({
  emitter: './models/group',
  subclass: 'schema',
  emitterModule: 'api'
}));
statsMaster.addListeners('socket', childProcess.setupEventProxy({
  emitter: './api/socket-handler',
  subclass: 'instance',
  emitterModule: 'api'
}));

// handle uncaught exceptions
process.on('uncaughtException', function(err) {
  logger.error(err);
});

// Export analytics module itself as a child process
module.exports = childProcess;
