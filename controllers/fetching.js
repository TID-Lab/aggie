// This file will initialize any necessary components for the operation of the
// fetching module, along with determining event proxies for communication
// between this and other modules.

var childProcess = require('./child-process');

// Initialize Bot Master
var eventProxy = childProcess.createEventProxy({source: 'Source', moduleName: 'api'});
require('./fetching/bot-master').init(eventProxy);

// Export fetching module itself as a child process
module.exports = childProcess;
