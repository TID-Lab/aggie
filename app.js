process.title = 'aggie';
var processManager = require('./lib/process-manager');

// Begins the three main app processes API, fetching, and analytics.
// See Readme files in lib subdirectores for more on each.
processManager.fork('/lib/api');
processManager.fork('/lib/fetching');
processManager.fork('/lib/analytics');

module.exports = processManager;
