process.title = 'aggie';
var processManager = require('./lib/process-manager');
processManager.fork('/lib/api');
processManager.fork('/lib/fetching');
processManager.fork('/lib/analytics');

module.exports = processManager;
