var nodemailer = require('nodemailer');
var config = require('../config/secrets');
var _ = require('underscore');

var Mailer = function() {
  var method = config.email.transport.method;
  var options = config.email.transport.options || {};
  this.transport = nodemailer.createTransport(method, options);
};

Mailer.prototype.send = function(subject, body, to, from, callback) {
  if (typeof from === 'function') {
    callback = from;
    from = config.email.from;
  }
  if (!callback) callback = function() {};

  var mailOptions = {
    from: from || config.email.from,
    to: to,
    subject: subject,
    html: body
  };

  this.transport.sendMail(mailOptions, function(err, res) {
    if (err) return callback(err);
    callback(null, res);
  });
};

// Send email from pre-defined templates
Mailer.prototype.sendFromTemplate = function(options, callback) {
  var to = options.to || options.user.email;
  var from = options.from || config.email.from;
  var template = options.template;

  var subject = this.templates[template].subject;
  if (subject) subject = _.template(subject, options);
  var body = this.templates[template].body;
  if (body) body = _.template(body, options);

  this.send(subject, body, to, from, callback);
};

Mailer.prototype.templates = {
  newUser: {
    subject: 'Welcome to Aggie!',
    body: 'A new Aggie user account has been created for you!<p>Your username is <strong><%= user.username %></strong>.</p><p>To choose a password and login to your account, <a href="http://<%= host %>/choose_password/<%= token %>">click here</a> or copy the link below into your browser.</p><p>http://<%= host %>/choose_password/<%= token %></p><p>You are receiving this message because someone created an account on <%= host %> for this email address. If you were not expecting this, please disregard this email.</p>'
  },
  forgotPassword: {
    subject: 'Aggie Password Reset Request',
    body: '<p>To change your Aggie password, <a href="http://<%= host %>/password_reset/<%= token %>">click here</a> or copy the link below into your browser.</p><p>http://<%= host %>/password_reset/<%= token %></p><p>You are receiving this message because someone requested a new password from <%= host %> for an account registered with this email address. If you did not initiate this request, please ignore this email.</p>'
  }
};

module.exports = new Mailer();
