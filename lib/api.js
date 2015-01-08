// Sets up the API process, including express server.
// Sets up necessary event proxies.

process.title = 'aggie-api';

var childProcess = require('./child-process');
var path = require('path');
var http = require('http');
var logger = require('./logger');
var config = require('../config/secrets').get();
var S = require('string');
var strformat = require('strformat');

// Extend global error class
require('./error');

// Start express server
var express = require('express');
var app = express();
var server = http.createServer(app);

// Handle request time outs, return 500 in case of timeouts
function handleRequestTimeouts(req, res, next) {
  var requestTimeout = S(config.logger.api_request_timeout).toInt() * 1000;
  
  // exit if disabled
  if (requestTimeout <= 0) return next();
  
  var timeoutId = setTimeout(function() {
    // timeout has happened, something bad has happened, send 500 back
    logger.error('Timeout has occurred, request cannot be processed', {url: req.url});
    
    res.send(500);
  }, requestTimeout);
  
  var end = res.end;
  res.end = function(chunk, encoding){
    clearTimeout(timeoutId);
    
    res.end = end;
    res.end(chunk, encoding);
  };
  
  next();
}

// Log incoming api requests
function logRequests(req, res, next) {
  var requestLoggingEnabled = S(config.logger.log_api_requests).toBoolean();
  var responseLoggingEnabled = S(config.logger.log_api_responses).toBoolean();
  
  if (!responseLoggingEnabled && !responseLoggingEnabled) return next();
  
  var start = new Date();
  var clientIP = req.clientIP;
  var requestId = Math.floor((Math.random()*1000000));
  
  if (requestLoggingEnabled) {
    logger.debug(strformat('>>>> [{0}, {1}] {2} {3}', requestId, clientIP, req.method, req.url));
  }  
  
  if (responseLoggingEnabled) {
    var end = res.end;
    res.end = function(chunk, encoding){
      res.end = end;
      var duration = new Date() - start;
      logger.debug(strformat('<<<< [{0}, {1}] {2} {3} {4} {5}ms', requestId, clientIP, req.method, req.url, res.statusCode, duration));
      if (chunk) {
        logger.debug(chunk);
      }
      res.end(chunk, encoding);
    };
  }
  
  next();
}

// Add single-page app router
app.use(require('express-spa-router')(app, {
  ignore: ['api', 'explorer', 'session', 'logout', 'images'],
  staticPaths: ['js', 'css', 'templates'],
  noRoute: function(req, res, next) {
    req.url = '/';
    req.originalUrl = '/';
    return next();
  }
}));

// Enable user authentication and authorization
var auth = require('./api/authentication')(app);
require('./api/reset-password')(app, auth);
var user = require('./api/authorization')(app, auth);

// setup api logging
app.all('/api/*', express.logger('dev'));

// setup request timeout
app.all('/api/*', handleRequestTimeouts);

// logging middleware
app.all('/api/*', logRequests);

// Ensure that all API calls are authenticated
app.all('/api/*', auth.ensureAuthenticated);

// Add all API controllers

var fetchingController = require('./api/v1/fetching-controller');
app.use(fetchingController);

require('./api/v1/incident-controller')(app, user);
require('./api/v1/report-controller')(app, user);
require('./api/v1/source-controller')(app, user);

var trendController = require('./api/v1/trend-controller')(app, user);

require('./api/v1/user-controller')(app, user);

var socketHandler = require('./api/socket-handler')(app, server, auth);
var streamer = require('./api/streamer');

// Create event proxy between trend controller and trend master
trendController.addListeners('trendMaster', childProcess.setupEventProxy({
  emitter: '/lib/analytics/trend-master',
  emitterModule: 'analytics'
}));

// Create event proxy between other modules and streamer
streamer.addListeners('report', childProcess.setupEventProxy({
  emitter: '/models/report',
  subclass: 'schema',
  emitterModule: 'fetching'
}));
socketHandler.addListeners('source', childProcess.setupEventProxy({
  emitter: '/models/source',
  subclass: 'schema',
  emitterModule: 'fetching'
}));
socketHandler.addListeners('trends', childProcess.setupEventProxy({
  emitter: '/lib/analytics/trend-master',
  emitterModule: 'analytics'
}));
// Defer local listeners until inter-process listeners have been set up to avoid binding conflicts
setTimeout(function() {
  socketHandler.addListeners('sourceLocal', require('../models/source').schema);
  streamer.addListeners('reportUpdates', require('../models/report').schema);
  streamer.addListeners('incident', require('../models/incident').schema);
}, 500);

// Compile .scss files to .css
var sass = require('node-sass');
app.use(sass.middleware({
  src: path.join(__dirname, '../public/angular/sass'),
  dest: path.join(__dirname, '../public/angular/css'),
  force: true,
  prefix: '/css'
}));

// The API explorer is a client-side thing so it's loaded as static.
app.use('/explorer', express.static(path.join(__dirname, '../public/explorer')));

// Exposed shared classes to the client
app.use('/shared', express.static(path.join(__dirname, '../shared')));
app.use('/client', express.static(path.join(__dirname, '../client')));

// Load single-page app statically from root path
app.use('/', express.static(path.join(__dirname, '../public/angular')));

// handle all errors and log them
process.on('uncaughtException', function (err) {
  logger.error(err);
});
app.use(function(err, req, res, next){
  if (err) {
    logger.error(err);
    res.send(500);
  }
  else {
    next();
  }
});

// Listen for API in a different port
app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function() {
  logger.info("✔ Aggie is listening on port " + app.get('port'));
});

module.exports = childProcess;
module.exports.app = app;
