// Handles login, logout, and obtaining current user session object.
// Uses Passport node package.

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var User = require('../../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('../../config/secrets').get();
var database = require('../../lib/database.js');
var _ = require('underscore');

module.exports = function(app) {
  app = app || express();
  var auth = {};

  // Configure session storage
  auth.key = 'connect.sid';
  auth.stubKey = 'aggie.auth';
  auth.stubCookie = { path: '/', httpOnly: true, maxAge: 864e9 };

  // Old library version uses mongoose_connection rather than mongooseConnection
  auth.store = new MongoStore({ mongoose_connection: database.mongoose.connection });
  auth.secret = config.secret;
  auth.session = express.session({
    key: auth.key,
    secret: auth.secret,
    store: auth.store,
    cookie: auth.stubCookie
  });
  auth.session.key = auth.key;
  auth.adminParty = config.adminParty;

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
      done(err, user ? user.toJSON() : {});
    });
  });

  // Use the LocalStrategy within Passport
  //   Strategies in passport require a `verify` function, which accept
  //   credentials (in this case, a username and password), and invoke a callback
  //   with a user object.
  passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Unknown user ' + username });
      user.comparePassword(password, function(err, isMatch) {
        if (err) return done(err);
        if (isMatch) return done(null, user.toJSON());
        return done(null, false, { message: 'Invalid password' });
      });
    });
  }));

  // Configure Express
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(auth.session);

  // Initialize Passport. Also use passport.session() middleware, to support
  // persistent login sessions.
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  // Passively instantiate the session via cookie in request
  app.use(function(req, res, next) {
    if ((req.session && req.session.user) || auth.adminParty) {
      res.cookie(auth.stubKey, 'yes', auth.stubCookie);
    } else {
      res.cookie(auth.stubKey, 'no', auth.stubCookie);
    }
    auth.session(req, res, next);
  });

  function sessionStatus(req, res, next) {
    if (req.session.user) {
      // Keep the session fresh
      req.session.touch();
      res.cookie(auth.stubKey, 'yes', auth.stubCookie);
      res.send(200, _.omit(req.session.user, 'password'));
    } else {
      // There's no user object, so we'll just destroy the session
      res.cookie(auth.key, '', _.defaults({ maxAge: -864e9 }, req.session.cookie));
      res.cookie(auth.stubKey, 'no', auth.stubCookie);
      req.session.destroy(function(err) {
        if (err) return next(err);
        res.send(200, {});
      });
    }
  }

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
        sessionStatus(req, res, next);
      });
    })(req, res, next);
  });

  // Log the user out
  app.get('/logout', function(req, res, next) {
    req.logout();
    delete req.session.user;
    // The cookie will be deleted by `sessionStatus()`
    sessionStatus(req, res, next);
  });

  // Return the currently logged-in user object
  app.get('/session', sessionStatus.bind(this));

  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected.  If
  //   the request is authenticated (typically via a persistent login session),
  //   the request will proceed.
  auth.ensureAuthenticated = function(req, res, next) {
    // Verify if user is authenticated
    if (auth.adminParty || req.skipAuthentication || req.isAuthenticated()) {
      return next();
    }
    res.send(403);
  };

  // Use this route middleware on any resource that is public, so that it
  // skips the above authentication, as by default all API routes are to be
  // authenticated.
  auth.skipAuthentication = function(req, res, next) {
    req.skipAuthentication = true;
    return next();
  };

  return auth;
};
