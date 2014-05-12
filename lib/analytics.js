// This file will initialize any necessary components for the operation of the
// analytics module, along with determining event proxies for communication
// between this and other modules.

var childProcess = require('./child-process');

// Extend global error class
require('./error');

// Initialize Trend Master and add event proxies
var trendMaster = require('./analytics/trend-master');
trendMaster.addListeners('trend', childProcess.setupEventProxy({
  emitter: '/models/trend',
  subclass: 'schema',
  emitterModule: 'api'
}));
trendMaster.addListeners('report', childProcess.setupEventProxy({
  emitter: '/models/report',
  subclass: 'schema',
  emitterModule: 'fetching'
}));
trendMaster.addListeners('fetching', childProcess.setupEventProxy({
  emitter: '/lib/api/v1/fetching-controller',
  emitterModule: 'api'
}));
trendMaster.init();

// Export analytics module itself as a child process
module.exports = childProcess;
module.exports.trendMaster = trendMaster;
