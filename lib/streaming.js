// This file will initialize any necessary components for the operation of the
// streaming module, along with determining event proxies for communication
// between this and other modules.

var childProcess = require('./child-process');

// Initialize Streamer
require('./streaming/streamer');

// Export streaming module itself as a child process
module.exports = childProcess;
