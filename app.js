var processManager = require('./lib/process-manager');
processManager.fork('/lib/api');
processManager.fork('/lib/fetching');

module.exports = processManager;
