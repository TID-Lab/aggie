// Handles login, logout, and obtaining current user session object.
// Uses Passport node package.
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo');
var User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var config = require('../config/secrets').get();
var database = require('../database.js');
var _ = require('underscore');

module.exports = function(app) {
  let auth = {};

  // Configure session storage
  auth.key = 'connect.sid';
  auth.stubKey = 'aggie.auth';
  auth.stubCookie = { path: '/', httpOnly: true, maxAge: 864e9 };
  auth.store = MongoStore.create({
    mongoUrl: database.DATABASE_URL,
    dbName: database.DATABASE_NAME,
  });
  auth.secret = config.secret;
  auth.session = session({
    key: auth.key,
    secret: auth.secret,
    store: auth.store,
    cookie: auth.stubCookie,
    resave: false,
    saveUninitialized: false
  });
  auth.session.key = auth.key;
  auth.adminParty = config.adminParty;

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.
  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  // Use the LocalStrategy within Passport
  //   Strategies in passport require a `verify` function, which accept
  //   credentials (in this case, a username and password), and invoke a callback
  //   with a user object.


  // Configure Express
  app.use(auth.session);
  // Initialize Passport. Also use passport.session() middleware, to support
  // persistent login sessions.
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(bodyParser.json());

  app.post('/register', function(req, res) {
    User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, function(err, account) {
      if (err) {
        return res.status(err.status).send(err._message);
      }
      passport.authenticate('local')(req, res, function () {
        res.redirect('/');
      });
    });
  });

  app.get('/login', function(req, res) {
    res.render('login', { user : req.user });
  });

  app.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/ping', function(req, res){
    res.send("pong!", 200);
  });

  return auth;
};
