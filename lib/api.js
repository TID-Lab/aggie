API_VERSION = '0.2';

var childProcess = require('./child-process');
var path = require('path');

// Extend global error class
require('./error');

// Start express server
var express = require('express');
var app = express();

// Add single-page app router
app.use(require('express-spa-router')(app, {
  ignore: ['api', 'explorer']
}));

// Enable user authentication
var auth = require('./api/authentication');
app.use(auth);
require('./api/reset-password')(app, auth);

// Ensure that all API calls are authenticated
app.all('/api/*', auth.ensureAuthenticated);

// Add all API controllers
var fetchingController = require('./api/' + API_VERSION + '/fetching-controller');
app.use(fetchingController);
require('./api/' + API_VERSION + '/report-controller')(app);
require('./api/' + API_VERSION + '/source-controller')(app);
require('./api/' + API_VERSION + '/user-controller')(app);

// Create event proxy between fetching controller and bot master
fetchingController.addListeners('botMaster', childProcess.setupEventProxy({
  emitter: '/lib/fetching/bot-master',
  emitterModule: 'fetching'
}));

// Load single-page app statically from root path
app.use('/', express.static(path.join(__dirname, '../public/angular')));
// The API explorer is a client-side thing so it's loaded as static.
app.use('/explorer', express.static(path.join(__dirname, '../public/explorer')));

// Listen for API in a different port
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log("✔ Aggie is listening on port %d", app.get('port'));
});

module.exports = childProcess;
module.exports.app = app;
