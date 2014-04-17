var nodemailer = require('nodemailer');
var config = require('../config/secrets');
var _ = require('underscore');

var Mailer = function() {
  this.smtpTransport = nodemailer.createTransport(config.email.transport[0]);
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

  this.smtpTransport.sendMail(mailOptions, function(err, res) {
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
    subject: 'New user created',
    body: 'Hi <%= user.email %>,<br><br>A new user has been created...'
  },
  forgotPassword: {
    subject: 'Your password reset request',
    body: 'Greetings,<br><p>To change your password follow <a href="http://<%= host %>/reset-password/<%= token %>">this link to login</a>, or copy the link below into your browser.</p>http://<%= host %>/reset-password/<%= token %><p>You are receiving this message because someone requested a new password from <%= host %> for an account registered with this email address.</p>'
  }
};

module.exports = new Mailer();
