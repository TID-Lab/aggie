var childProcess = require('./child-process');

// Start express server
var express = require('express');
var app = express();

// Add all controllers
var fetchingController = require('./api/fetching-controller');
app.use(fetchingController);
app.use(require('./api/report-controller'));
app.use(require('./api/source-controller'));
app.use(require('./api/user-controller'));

// Create event proxy between fetching controller and bot master
fetchingController.addListeners('botMaster', childProcess.setupEventProxy({
  emitter: '/controllers/fetching/bot-master',
  emitterModule: 'fetching'
}));

// Listen for API in a different port
// TODO: Send handler between parent and child process to reuse port number
app.set('port', process.env.PORT ? process.env.PORT + 1 : 3001);
app.listen(app.get('port'), function() {
  console.log("✔ Aggie API listening on port %d", app.get('port'));
});

module.exports = childProcess;
module.exports.app = app;
