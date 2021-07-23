/* eslint-disable no-invalid-this */
// Represents a set of credentials that you want to keep protected.
'use strict';

const database = require('../lib/database');
const mongoose = database.mongoose;
const Schema = mongoose.Schema;
const validator = require('validator');


// The types of credentials that are possible.
// Add more as you see fit.
const credentialsTypes = [
  'twitter',
  'crowdtangle',
  'telegram',
  'elmo',
  'smtp',
  'aws_ses',
  'sendgrid'
];

// validates secrete based on their type
const secretsValidator = function(secrets) {
  function isValidString(value) {
    return (
      typeof value === 'string'
      && value.length > 0
    );
  }

  if (typeof secrets !== 'object') return false;

  switch (this.type) {
  case 'crowdtangle':
    return isValidString(secrets.dashboardAPIToken); // dashboard API token
  case 'twitter':
    return (
      isValidString(secrets.consumerKey)
      && isValidString(secrets.consumerSecret)
      && isValidString(secrets.accessToken)
      && isValidString(secrets.accessTokenSecret)
    );
  case 'telegram':
    return isValidString(secrets.botAPIToken); // bot API token
  case 'elmo':
    return isValidString(secrets.authToken); // ELMO auth token
  case 'smtp':
    return isValidString(secrets.username)
      && isValidString(secrets.password)
      && isValidString(secrets.host)
      && typeof secrets.port === 'number'
      && typeof secrets.secure === 'boolean';
  case 'aws_ses':
    return isValidString(secrets.accessKeyID)
      && isValidString(secrets.secretAccessKey)
      && isValidString(secrets.region);
  case 'sendgrid':
    return isValidString(secrets.apiKey);
  default:
  }
};

const nameValidator = function(name) {
  return validator.isLength(name, {min: 1, max: 20});
}

const credentialsSchema = new Schema({
  name: { type: String, required: true, validate: nameValidator },
  secrets: { type: Schema.Types.Mixed, validate: secretsValidator },
  type: { type: String, required: true, enum: credentialsTypes }
});

credentialsSchema.methods.stripSecrets = function() {
  this.secrets = undefined;
};

const Credentials = mongoose.model('Credentials', credentialsSchema);

module.exports = Credentials;
