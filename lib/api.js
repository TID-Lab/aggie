var childProcess = require('./child-process');
var path = require('path');
var http = require('http');

// Extend global error class
require('./error');

// Start express server
var express = require('express');
var app = express();
var server = http.createServer(app);

// Add single-page app router
app.use(require('express-spa-router')(app, {
  ignore: ['api', 'explorer'],
  staticPaths: ['js', 'css', 'templates'],
  noRoute: function(req, res, next) {
    req.url = '/';
    req.originalUrl = '/';
    return next();
  }
}));

// Enable user authentication
var auth = require('./api/authentication')(app);
require('./api/reset-password')(app, auth);

// Ensure that all API calls are authenticated
app.all('/api/*', auth.ensureAuthenticated);

// Add all API controllers
var fetchingController = require('./api/v1/fetching-controller');
app.use(fetchingController);
require('./api/v1/report-controller')(app);
require('./api/v1/source-controller')(app);
require('./api/v1/user-controller')(app);
require('./api/socket-handler')(app, server, auth);
var streamer = require('./api/streamer');

// Create event proxy between fetching controller and bot master
fetchingController.addListeners('botMaster', childProcess.setupEventProxy({
  emitter: '/lib/fetching/bot-master',
  emitterModule: 'fetching'
}));
// Create event proxy between reports and streamer
streamer.addListeners('report', childProcess.setupEventProxy({
  emitter: '/models/report',
  subclass: 'schema',
  emitterModule: 'fetching'
}));

// Compile .scss files to .css
var sass = require('node-sass');
app.use(sass.middleware({
  src: path.join(__dirname, '../public/angular/sass'),
  dest: path.join(__dirname, '../public/angular/css'),
  outputStyle: 'compressed',
  prefix: '/css'
}));


// The API explorer is a client-side thing so it's loaded as static.
app.use('/explorer', express.static(path.join(__dirname, '../public/explorer')));

// Serve static files from public/angular
app.use('/', express.static(path.join(__dirname, '../public/angular')));

// Listen for API in a different port
app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function() {
  console.log("✔ Aggie is listening on port %d", app.get('port'));
});

module.exports = childProcess;
module.exports.app = app;
