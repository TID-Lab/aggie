// This is used as authentication middleware
const User = require('../models/user');
const passport = require('passport');
const config = require('../config/secrets').get();
require('dotenv').config();
const passportJWT = require("passport-jwt");
const Strategy = passportJWT.Strategy;

const cookieExtractor = function(req) {
  var token = null;
  if (req && req.cookies)
  {
    token = req.cookies['jwt'];
  }
  return token;
};

const params = {
  secretOrKey: process.env.SECRET,
  jwtFromRequest: cookieExtractor
};

module.exports = function() {
  const strategy = new Strategy(params, function(payload, done) {
    var user = User.findById(payload.id, function(err, user) {
      if (err) {
        return done(new Error("User Not Found"), null);
      } else if(payload.expire<=Date.now()) {
        return done(new Error("Token Expired"), null);
      } else{
        return done(null, user);
      }
    });
  });
  passport.use(strategy);
  return {
    initialize: function() {
      return passport.initialize();
    },
    authenticate: function() {
      return passport.authenticate("jwt", config.jwtSession);
    }
  };
};