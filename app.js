var processManager = require('./controllers/process-manager');
processManager.fork('/controllers/api');
processManager.fork('/controllers/fetching');

module.exports = processManager;
