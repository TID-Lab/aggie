var _ = require('underscore');
var config = require('../config/secrets');
var mongoose = require('mongoose');
var express = require('express');

var API = function() {
  this.config = config;
  this.mongoose = mongoose;
  this.app = express();
  this.mongoConnect();
};

API.prototype.mongoConnect = function() {
  // Override secrets.json if environment variable is set
  var mongoConnectionURL = process.env.MONGO_CONNECTION_URL;
  if (!mongoConnectionURL) {
    mongoConnectionURL = 'mongodb://';
    var username = this.config.mongodb.username;
    var password = this.config.mongodb.password;
    if (username && password) {
      mongoConnectionURL += username + ':' + password + '@';
    }
    mongoConnectionURL += this.config.mongodb.host;
    if (this.config.mongodb.port) mongoConnectionURL += ':' + this.config.mongodb.port;
    mongoConnectionURL += '/' + this.config.mongodb.db;
  }
  this.mongoose.connect(mongoConnectionURL);
};

module.exports = new API();
