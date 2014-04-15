var express = require('express');
var app = express();
var email = require('email');
var User = require('../../models/user');
var config = require('../../config/secrets');
var crypto = require('crypto');
var Buffer = require('buffer').Buffer;
var _ = require('underscore');
var authentication = require('./authentication');

var PASSWORD_RESET_TIMEOUT = 86400;

app.use(express.bodyParser());
app.get('/reset-password/:token', tokenLogin.bind(this), resetPassword.bind(this));
app.post('/reset-password', authEmail.bind(this));

// Generate a new session for the user identified by the token.
function tokenLogin(req, res, next) {
  var message = decryptExpiringRequest(req.params.token, config.secret, PASSWORD_RESET_TIMEOUT);
  var error = new Error('Invalid login token');

  if (message.data) {
    // Obtain salt for user.
    User.findOne({username: message.data}, function(err, user) {
      if (err) return next(error);
      var salt = user.password;
      if (verifyExpiringRequest(message, salt)) {
        req.user = user;
        next();
      } else {
        next(error);
      }
    });
  } else {
    next(error);
  }
};

// Turn a string into a base64 token encrypted with the secret and with a
// message digest based on the salt.
function encryptExpiringRequest(data, secret, salt) {
  data = new Buffer(JSON.stringify(data), 'utf8').toString('binary');
  var cipher = crypto.createCipher('aes-256-cfb', secret);
  var timestamp = (Date.now() / 1000).toFixed();
  while (timestamp.length < 10) timestamp = '0' + timestamp;
  var hash = crypto.createHash('sha256').update(salt).update(timestamp).update(data).digest('binary');
  var request = cipher.update(hash, 'binary', 'binary') +
                cipher.update(timestamp, 'binary', 'binary') +
                cipher.update(data, 'binary', 'binary') +
                cipher['final']('binary');
  return new Buffer(request, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
};

// Decrypt a token.
function decryptExpiringRequest(data, secret, maxAge) {
  if (typeof maxAge === 'undefined') maxAge = PASSWORD_RESET_TIMEOUT;
  var decipher = crypto.createDecipher('aes-256-cfb', secret);
  var request = decipher.update(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64', 'binary')
    + decipher['final']('binary');
  var timestamp = parseInt(request.substring(32, 42), 10) || -1;
  var result = { request: request, generated: timestamp };
  if ((Date.now() / 1000).toFixed() > (timestamp + maxAge)) return result;
  try { result.data = JSON.parse(new Buffer(request.substring(42), 'binary').toString('utf8')); }
  catch (err) {}
  return result;
};

// Verify authenticity of a decrypted request.
function verifyExpiringRequest(message, salt) {
  var hash = crypto.createHash('sha256').update(salt).update(message.request.substring(32));
  return hash.digest('binary') === message.request.substring(0, 32);
};

function resetPassword(req, res, next) {
  authentication.session(req, res, function() {
    // Set the password to a random unguessable value to
    // prevent multiple logins with the same token.
    req.user.password = crypto.createHash('sha256')
      .update(req.user.password).update('' + Math.random())
      .digest('hex');

    req.user.save(function(err, user) {
      if (err) return next(err);
      // Set a stub cookie that can also be read via HTTP
      // (The session cookie might not). Aids in nginx configuration.
      res.cookie(authentication.stubKey, 'yes', authentication.stubCookie);

      req.session.regenerate(function() {
        req.session.user = req.user;
        req.session.user.authenticated = true;

        // Applications should bind on /reset-password/* and redirect
        // to the path of their choice.
        next();
      });
    });
  });
};

// Send an email to the user containing a login link with a token.
function authEmail(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) return next(err);
    if (!user.email || !email.isValidAddress(user.email)) {
      next(new Error('Invalid email address'));
    } else {
      generateEmail(user, req).send(function(err) {
        if (err) next(new Error('Could not send email. Contact your administrator.'));
        else res.send(200, { message: 'Email has been sent' });
      });
    }
  });
};

var resetPasswordEmailTemplate = '<html>';
resetPasswordEmailTemplate += '<body>';
resetPasswordEmailTemplate += '<p>Greetings,</p>';
resetPasswordEmailTemplate += '<br>';
resetPasswordEmailTemplate += '<p>To change your password follow <a href="http://<%= host %>/reset-password/<%= token %>">this link to login</a>, or copy the link below into your browser.</p>';
resetPasswordEmailTemplate += 'http://<%= host %>/reset-password/<%= token %>';
resetPasswordEmailTemplate += '<br>';
resetPasswordEmailTemplate += '<p>You are receiving this message because someone requested a new password from <%= host %> for an account registered with this email address.</p>';
resetPasswordEmailTemplate += '</body>';
resetPasswordEmailTemplate += '</html>';

// Generate an email object with a login token.
function generateEmail(user, req) {
  var salt = user.password;
  var token = encryptExpiringRequest(user.username, config.secret, salt);

  var subject = 'Your password reset request';
  var body = _.template(resetPasswordEmailTemplate, {token: token, host: req.headers.host});

  var mail = new email.Email({
      from: config.adminEmail,
      to: '<' + user.email + '>',
      bodyType: 'html',
      subject: subject,
      body: body
  });

  return mail;
};

module.exports = app;
