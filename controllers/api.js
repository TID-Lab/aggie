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

// The API explorer is a client-side thing so it's loaded as static.
var path = require('path');
app.use('/explorer', express.static(path.join(__dirname, '../public/explorer')));

// Listen for API in a different port
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log("✔ Aggie is listening on port %d", app.get('port'));
});

module.exports = childProcess;
module.exports.app = app;
