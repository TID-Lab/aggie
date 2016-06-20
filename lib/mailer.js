'use strict';

var nodemailer = require('nodemailer');
var config = require('../config/secrets');
var _ = require('underscore');
var logger = require('./logger');
var ses = require('nodemailer-ses-transport');
var sendGrid = require('nodemailer-sendgrid-transport');
var locale = require('locale');

function Mailer() {
  this.reloadTransport();
}

Mailer.prototype.reloadTransport = function() {
  var method;
  this.config = config.get();
  var options = _.clone(this.config.email.transport.options) || {};

  switch (this.config.email.transport.method) {
  case 'SES':
    method = ses;
    break;
  case 'SendGrid':
    method = sendGrid;
    options.auth = { api_key: options.api_key };
    break;
  case 'SMTP':
    // Creating transport for SMTP does not require special method, just the options
    options.auth = { user: options.user, pass: options.pass };
    method = _.identity;
    break;
  default:
    logger.error('No valid email transport method defined in configuration');
    return;
  }
  this.transport = nodemailer.createTransport(method(options));
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

function pickTemplate(templateName, acceptLanguage, templates) {
  var supportedNames = _.filter(_.keys(templates), function(lang) {
    return templates[lang][templateName];
  });
  var supported = new locale.Locales(supportedNames);
  var requested = new locale.Locales(acceptLanguage);
  var langName = requested.best(supported).language;
  logger.debug('Picking language for email. Supported: ' + supported +
               ', requested: ' + requested + ', best: ' + langName);
  return templates[langName][templateName];
}

// Send email from pre-defined templates
Mailer.prototype.sendFromTemplate = function(options, callback) {
  var to = options.to || options.user.email;
  var from = options.from || this.config.email.from;
  var template = pickTemplate(options.template, options.acceptLanguage,
                              this.templates);

  var subject = template.subject;
  if (subject) subject = _.template(subject, options);
  var body = template.body;
  if (body) body = _.template(body, options);

  this.send(subject, body, to, from, callback);
};

Mailer.prototype.templates = {
  en: {
    newUser: {
      subject: 'Welcome to Aggie!',
      body: '<p>A new Aggie user account has been created for you!<p>Your username is <strong><%= user.username %></strong>.</p><p>To choose a password and login to your account, <a href="<%= protocol %>://<%= host %>/choose_password/<%= token %>">click here</a> or copy the link below into your browser.</p><p><%= protocol %>://<%= host %>/choose_password/<%= token %></p><p>You are receiving this message because someone created an account on <%= host %> for this email address. If you were not expecting this, please disregard this email.</p>'
    },
    forgotPassword: {
      subject: 'Aggie Password Reset Request',
      body: '<p>To change your Aggie password, <a href="<%= protocol %>://<%= host %>/password_reset/<%= token %>">click here</a> or copy the link below into your browser.</p><p><%= protocol %>://<%= host %>/password_reset/<%= token %></p><p>You are receiving this message because someone requested a new password from <%= host %> for an account registered with this email address. If you did not initiate this request, please ignore this email.</p>'
    }
  },
  es: {
    newUser: {
      subject: 'Bienvenido a Aggie!',
      body: '<p>Se ha creado una nueva cuenta en Aggie para ti. Tu nombre de usuario es <strong><%= user.username %></strong>.</p><p>Para acceder a tu cuenta y elegir tu contraseña accede a esta<a href="<%= protocol %>://<%= host %>/choose_password/<%= token %>">página</a> o copia el siguiente enlace en tu navegador:</p><p><%= protocol %>://<%= host %>/choose_password/<%= token %></p><p>Has recibido este mensaje porque alguien ha creado una cuenta en <%= host %> con tu dirección de correo electrónico. Si no esperaba esta invitación, puede ignorar este correo electrónico.</p>'
    },
    forgotPassword: {
      subject: 'Aggie: Solicitud para cambiar la contraseña',
      body: '<p>Para cambiar tu contraseña haz <a href="<%= protocol %>://<%= host %>/password_reset/<%= token %>">click aquí</a> o copia el siguiente enlace en tu navegador:</p><p><%= protocol %>://<%= host %>/password_reset/<%= token %></p><p>Has recibido este mensaje porque alguien ha pedido cambiar la contraseña en <%= host %> de una cuenta con esta dirección de correo electrónico. Si no esperaba este correo electrónico, puede ignorar este correo electrónico.</p>'
    }
  }
  // Add new languages here
};

module.exports = new Mailer();
