var processManager = require('./controllers/process-manager');
processManager.fork('/controllers/api');
processManager.fork('/controllers/fetching');
processManager.fork('/controllers/streaming');

module.exports = processManager;
