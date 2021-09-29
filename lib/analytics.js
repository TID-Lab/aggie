// Sets up the analytics process and its event proxies.

process.title = 'aggie-analytics';

// This file will initialize any necessary components for the operation of the
// analytics module, along with determining event proxies for communication
// between this and other modules.

var childProcess = require('./child-process');
var logger = require('./logger');

// Extend global error class
require('./error');

var statsMaster = require('./analytics/stats-master');
statsMaster.addListeners('report', childProcess.setupEventProxy({
  emitter: '/models/report',
  subclass: 'schema',
  emitterModule: 'api'
}));
statsMaster.addListeners('incident', childProcess.setupEventProxy({
  emitter: '/models/incident',
  subclass: 'schema',
  emitterModule: 'api'
}));
statsMaster.addListeners('socket', childProcess.setupEventProxy({
  emitter: '/lib/api/socket-handler',
  subclass: 'instance',
  emitterModule: 'api'
}));

// handle uncaught exceptions
process.on('uncaughtException', function(err) {
  logger.error(err);
});

// Export analytics module itself as a child process
module.exports = childProcess;
