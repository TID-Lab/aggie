process.title = 'aggie-fetching';

// This file will initialize any necessary components for the operation of the
// fetching module, along with determining event proxies for communication
// between this and other modules.

var childProcess = require('./child-process');

// Extend global error class
require('./error');

// Initialize Bot Master and add event proxies
var botMaster = require('./fetching/bot-master');
botMaster.addListeners('source', childProcess.setupEventProxy({
  emitter: '/models/source',
  subclass: 'schema',
  emitterModule: 'api'
}));
botMaster.addListeners('fetching', childProcess.setupEventProxy({
  emitter: '/lib/api/v1/fetching-controller',
  emitterModule: 'api'
}));

// Initialize Report Writer
var reportWriter = require('./fetching/report-writer');

// Export fetching module itself as a child process
module.exports = childProcess;
module.exports.botMaster = botMaster;
module.exports.reportWriter = reportWriter;
