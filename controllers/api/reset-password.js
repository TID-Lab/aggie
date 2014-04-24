var express = require('express');
var app = express();
var mailer = require('../mailer');
var User = require('../../models/user');
var config = require('../../config/secrets');
var crypto = require('crypto');
var Buffer = require('buffer').Buffer;
var _ = require('underscore');

var PASSWORD_RESET_TIMEOUT = 86400000;

module.exports = function(app, auth) {
  app.use(express.bodyParser());

  app.post('/reset-password', authEmail.bind(this));
  app.put('/reset-password', tokenLogin.bind(this), resetPassword.bind(this));

  // Send an email to the user containing a login link with a token.
  function authEmail(req, res, next) {
    User.findOne({email: req.body.email}, function(err, user) {
      if (err) return next(err);
      if (!user.email) return next(new Error.NotFound('email_not_found'));
      sendEmail(user, req, function(err) {
        if (err) next(new Error('could_not_send_email'));
        else res.send(200);
      });
    });
  }

  // Generate an email object with a login token.
  function sendEmail(user, req, callback) {
    var token = encodeToken(user);

    mailer.sendFromTemplate({
      template: 'forgotPassword',
      user: user,
      token: token,
      host: req.headers.host
    }, callback);
  }

  // Encode user token
  function encodeToken(user) {
    var cipher = crypto.createCipher('aes-256-cbc', config.secret);
    var hash = {username: user.username, timestamp: Date.now()};
    var encryptedHash = cipher.update(JSON.stringify(hash), 'utf8', 'base64');
    var token = encryptedHash + cipher.final('base64');
    return token;
  }

  // Decode user token
  function decodeToken(token) {
    var decipher = crypto.createDecipher('aes-256-cbc', config.secret);
    var decryptedHash = decipher.update(token, 'base64', 'utf8');
    var hash;
    try {
      hash = decryptedHash + decipher.final('utf8');
      hash = JSON.parse(hash);
    } catch (e) {}
    if (hash) {
      if (hash.timestamp + PASSWORD_RESET_TIMEOUT > Date.now()) {
        return hash.username;
      }
    }
  }

  // Generate a new session for the user identified by the token.
  function tokenLogin(req, res, next) {
    if (!req.body.token) return next(new Error.NotFound('token_not_found'));
    var username = decodeToken(req.body.token);
    if (!username) return next(new Error.NotFound('user_not_found'));
    User.findOne({username: username}, function(err, user) {
      if (err) return next(err);
      req.user = user;
      next();
    });
  }

  // Reset user password
  function resetPassword(req, res, next) {
    auth.session(req, res, function() {
      req.user.password = req.body.password;
      req.user.save(function(err, user) {
        if (err) return next(err);
        // Set a stub cookie that can also be read via HTTP
        // (The session cookie might not). Aids in nginx configuration.
        res.cookie(auth.stubKey, 'yes', auth.stubCookie);

        req.session.regenerate(function() {
          req.session.user = user;
          req.session.user.authenticated = true;

          res.send(200);
        });
      });
    });
  }

  return app;
};
