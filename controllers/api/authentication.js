var express = require('express');
var MongoStore = require('connect-mongo')(express);
var User = require('../../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('../../config/secrets');
var _ = require('underscore');
var app = express();

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Use the LocalStrategy within Passport
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({username: username}, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, {message: 'Unknown user ' + username});
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if (isMatch) return done(null, user);
      return done(null, false, {message: 'Invalid password'})
    });
  });
}));

// Configure Express
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());

// Configure session storage
var key = 'connect.sid';
var stubKey = 'aggie.auth';
var stubCookie = {path: '/', httpOnly: true, maxAge: 864e9};
var store = new MongoStore(config.mongodb);
var session = express.session({
  key: key,
  secret: config.secret,
  store: store,
  cookie: stubCookie
});
session.key = key;
app.use(session);

// Passively instantiate the session via cookie in request
app.use(function(req, res, next) {
  if (req.cookies[key]) {
    res.cookie(stubKey, 'yes', stubCookie);
    session(req, res, next);
  } else {
    // Delete the stub cookie if one exists.
    if (req.cookies[stubKey]) res.cookie(stubKey, '', _.defaults({ maxAge: - 864e9 }, stubCookie));
    next();
  }
});

// Initialize Passport. Also use passport.session() middleware, to support
// persistent login sessions.
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

// Use passport.authenticate() as route middleware to authenticate the request
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.session.messages = [info.message];
      return res.send(403, info.message);
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      // Store user object in session
      req.session.user = _.clone(req.user);
      return res.send(200, _.omit(user.toJSON(), 'password'));
    });
  })(req, res, next);
});

app.get('/logout', function(req, res) {
  req.logout();
  delete req.session.user;
  res.send(200);
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.
function ensureAuthenticated(req, res, next) {
  if (config.adminParty || req.isAuthenticated()) return next();
  res.send(403);
};

module.exports = app;
module.exports.session = session;
module.exports.key = key;
module.exports.secret = config.secret;
module.exports.store = store;
module.exports.stubKey = stubKey;
module.exports.stubCookie = stubCookie;
module.exports.adminParty = config.adminParty;
module.exports.ensureAuthenticated = ensureAuthenticated;
