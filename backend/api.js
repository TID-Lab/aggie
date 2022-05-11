// Sets up the API process, including express server.
// Sets up necessary event proxies.

process.title = 'aggie-api';
var childProcess = require('./child-process');
var path = require('path');
var fs = require('fs');
var logger = require('./logger');
var morgan = require('morgan');
var config = require('./config/secrets');
var exec = require('child_process').exec;
var bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const auth = require('./api/authentication')();
const passport = require("passport");
const LocalStrategy = require('passport-local');
const authRoutes = require("./api/routes/authRoutes");
const User = require('./models/user');
var mailer = require('./mailer.js');
var _ = require("underscore");
var readLineSync = require('readline-sync');
var { version: packageVersion } = require("../package.json");
const cors = require('cors');
// Extend global error class
require('./error');
require('dotenv').config()

// Get full path for certificate files
var keyFile = path.resolve(__dirname, './config/key.pem');
var certFile = path.resolve(__dirname, './config/cert.pem');

// Start express server
var express = require('express');
var app = express();
// We default to https protocol, if certs are not found fallback to http
try {
  cert = fs.readFileSync(certFile);
} catch (e) {
  if (e.code === 'ENOENT') {
    cert = null;
  } else {
    throw e;
  }
}

var protocol;
var server;
if (cert) {
  protocol = 'https';
  try {
    // No passphrase when cert is generated with -nodes
    server = require('https').createServer({
      key: fs.readFileSync(keyFile),
      cert: cert,
    }, app);
  } catch {
    // Prompts for passphrase
    var passphrase = readLineSync.question("Enter PEM passphrase: ", {hideEchoBack: true})
    try {
        server = require('https').createServer({
          key: fs.readFileSync(keyFile),
          cert: cert,
          passphrase: passphrase
        }, app);
    } catch (error) {
      console.log('Wrong passphrase');
    }
  }
} else {
  protocol = 'http';
  server = require('http').createServer(app);
}

if (process.env.ENVIRONMENT === "development") {
  if (process.env.ADMIN_PARTY.toLowerCase() === "true") console.log("Admin Party is enabled.")
  if (process.env.ADMIN_PARTY.toLowerCase() === "false") console.log("Admin Party is disabled.")
  app.use(
      cors({
        origin: "http://localhost:8000", // allow to server to accept request from different origin
        optionsSuccessStatus:200,
        credentials: true, // allow session cookie from browser to pass through
      })
  );
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if ('OPTIONS' == req.method) {
      res.send(200);
    } else {
      next();
    }
  });
}

// Handle request time outs, return 500 in case of timeouts
function handleRequestTimeouts(req, res, next) {
  var requestTimeout = parseInt(config.get().api_request_timeout) * 1000;

  // exit if disabled
  if (requestTimeout <= 0) return next();

  var timeoutId = setTimeout(function() {
    // timeout has happened, something bad has happened, send 500 back
    logger.error('Timeout has occurred, request cannot be processed', { url: req.url });

    res.sendStatus(500);
  }, requestTimeout);

  var end = res.end;
  res.end = function(chunk, encoding) {
    clearTimeout(timeoutId);

    if (!res.headersSent) {
      res.end = end;
      res.end(chunk, encoding);
    }
  };

  next();
}

// Add middleware
//require('./api/language-cookie.js')(app);


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Enable user authentication and authorization
app.use(auth.initialize());
passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(authRoutes);

// setup api logging
app.all("/api/*", morgan('combined'));

// setup request timeout
app.all('/api/*', handleRequestTimeouts);

// Add all API controllers
const apiRouter = require('./api/routes/apiRoutes');

app.use('/api', auth.authenticate(), apiRouter);

if (process.env.ENVIRONMENT === "production") {
  // Handle Front-end Routes & Resources
// TODO: Why does express.static make all of the routes go through the file system, even when it fails.
  app.use('/static', express.static(path.join(__dirname, "..", 'build', "static")));
  app.use('/images', express.static(path.join(__dirname, "..", 'build', "images")));
  app.get('/manifest.json', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'manifest.json'));
  });
  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'favicon.ico'));
  });
  app.get('/logo192.png', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'logo192.png'));
  });
  app.get('/logo512.png', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'logo512.png'));
  });
  app.get('/robots.txt', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'robots.txt'));
  });
// All other GET requests not handled before will return our React app
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
}



var SocketHandler = require('./api/socket-handler');
var socketHandler = new SocketHandler(app, server, auth);
var streamer = require('./api/streamer');

// Create event proxy between other modules and streamer
// Keep in mind these paths are relative to the child-process.js file.
streamer.addListeners('report', childProcess.setupEventProxy({
  emitter: './models/report',
  subclass: 'schema',
  emitterModule: 'fetching'
}));

socketHandler.addListeners('source', childProcess.setupEventProxy({
  emitter: './models/source',
  subclass: 'schema',
  emitterModule: 'fetching'
}));

socketHandler.addListeners('stats', childProcess.setupEventProxy({
  emitter: './analytics/stats-master',
  emitterModule: 'analytics'
}));

// Defer local listeners until inter-process listeners have been set up to avoid binding conflicts
setTimeout(function() {
  socketHandler.addListeners('sourceLocal', require('./models/source').schema);
  socketHandler.addListeners('report', require('./models/report').schema);
  socketHandler.addListeners('tag', require('./models/tag').schema);
  streamer.addListeners('group', require('./models/group').schema);
  // Add listener to reload config and emit event to mailer
  /*
  settingsController.addListener('settingsUpdated', function(arguments) {
    config.get({ reload: true });
    switch (arguments.setting) {
    case 'email:transport':
      _.bind(mailer.reloadTransport, mailer)();
      break;
    case 'email':
      _.bind(mailer.reloadConfig, mailer)();
      break;
    }
  });*/
}, 500);

// Add CRON job for updating CrowdTangle List
//app.use(require('./cron/ct-list-update'));




// get git version
var version;
exec('git rev-parse --short HEAD', function(err, stdout, stderr) {
  if (err) {
    logger.warning(err);
  }
  version = `v${packageVersion}-${stdout.trim()}`;
  logger.info('✔ Aggie version: ' + version);
});

// handle all errors and log them
process.on('uncaughtException', function(err) {
  logger.error(err);
});
app.use(function(err, req, res, next) {
  if (err) {
    logger.error(err);
  }
  else {
    next();
  }
});

// Listen for API in a different port
app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function() {
  logger.info('✔ Aggie is listening on port ' + app.get('port'));
  logger.info('✔ Aggie is listening to protocol ' + protocol);
});

module.exports = childProcess;
module.exports.app = app;

