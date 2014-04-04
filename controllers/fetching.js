// This file will initialize any necessary components for the operation of the
// fetching module, along with determining event proxies for communication
// between this and other modules.

var childProcess = require('./child-process');

// Initialize Bot Master
var eventProxy = childProcess.createEventProxy({source: 'Source', moduleName: 'api'});
var botMaster = require('./fetching/bot-master');
botMaster.init(eventProxy);

// Initialize Report Writer
var reportWriter = require('./fetching/report-writer');

// Export fetching module itself as a child process
module.exports = childProcess;
module.exports.botMaster = botMaster;
module.exports.reportWriter = reportWriter;
