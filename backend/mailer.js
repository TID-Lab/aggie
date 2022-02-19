'use strict';

var nodemailer = require('nodemailer');
var config = require('./config/secrets');
var _ = require('underscore');
var logger = require('./logger');
var aws = require('aws-sdk');
var sendgrid = require('nodemailer-sendgrid')
var locale = require('locale');
var path = require('path');
var fs = require('graceful-fs');

function Mailer() {
  this.reloadTransport();
}

Mailer.prototype.templateLocation = 'backend/translations';
Mailer.prototype.templateNamePrefix = 'locale-';
Mailer.prototype.templateNameSuffix = '.json';
Mailer.prototype.templateNameRE = /^locale-(.*).json$/;

Mailer.prototype.reloadTransport = function() {
  var transportConfig;
  this.config = config.get();
  var options = _.clone(this.config.email.transport.options) || {};

  switch (this.config.email.transport.method) {
  case 'SES':
    aws.config.update(options)
    transportConfig = {
      SES: new aws.SES({
        apiVersion: '2010-12-01'
      })
    }
    break;
  case 'SendGrid':
    transportConfig = sendgrid(options);
    break;
  case 'SMTP':
    // Creating transport for SMTP does not require special method, just the transportConfig.options
    transportConfig = {
      ...options,
      auth: {
        user: options.user,
        pass: options.pass
      }
    }
    break;
  default:
    logger.error('No valid email transport method defined in configuration');
    return;
  }
  this.transport = nodemailer.createTransport(transportConfig);
};

Mailer.prototype.reloadConfig = function() {
  this.config = config.get();
};

Mailer.prototype.send = function(subject, body, to, from, callback) {
  if (typeof from === 'function') {
    callback = from;
    from = this.config.email.from;
  }
  if (!callback) callback = _.noop;

  var mailOptions = {
    from: from || this.config.email.from,
    to: to,
    subject: subject,
    html: body
  };
  this.transport.sendMail(mailOptions, function(err, res) {
    if (err) return callback(err);
    callback(null, res);
  });
};

Mailer.prototype.pickTemplate = function pickTemplate(templateName, acceptLanguage, templates, callback) {
  var that = this;
  fs.readdir(this.templateLocation, function(err, files) {
    if (err) return callback(err);
    files = _.filter(files, that.templateNameRE.test.bind(that.templateNameRE));
    var supportedNames = _.map(files, function(filename) {
      return that.templateNameRE.exec(filename)[1];
    });

    var supported = new locale.Locales(supportedNames);
    var requested = new locale.Locales(acceptLanguage);
    var langName = requested.best(supported).language;
    logger.debug('Picking language for email. Supported: ' + supported +
                 ', requested: ' + requested + ', best: ' + langName);
    var filename = that.templateNamePrefix + langName + that.templateNameSuffix;
    fs.readFile(path.join(that.templateLocation, filename), function(err, json) {
      if (err) return callback(err);
      var templates = JSON.parse(json);
      callback(null, templates[templateName]);
    });
  });
};

// Send email from pre-defined templates
Mailer.prototype.sendFromTemplate = function(options, callback) {
  var to = options.to || options.user.email;
  var from = options.from || this.config.email.from;
  var that = this;
  this.pickTemplate(options.template, options.acceptLanguage, this.templates,
               function mailTemplate(err, template) {
                 if (err) return callback(err);
                 var subject = template.subject;
                 if (subject) subject = _.template(subject)(options);
                 var body = template.body;
                 if (body) body = _.template(body)(options);
                 that.send(subject, body, to, from, callback);
               });
};

module.exports = new Mailer();
