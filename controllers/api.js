var childProcess = require('./child-process');

var getMongoConnectURL = function(config) {
  // Override secrets.json if environment variable is set
  var mongoConnectionURL = process.env.MONGO_CONNECTION_URL;
  if (!mongoConnectionURL) {
    mongoConnectionURL = 'mongodb://';
    if (config.username && config.password) {
      mongoConnectionURL += config.username + ':' + config.password + '@';
    }
    mongoConnectionURL += config.host;
    if (config.port) mongoConnectionURL += ':' + config.port;
    mongoConnectionURL += '/' + config.db;
  }
  return mongoConnectionURL;
};

// Initialize database connection
var mongoose = require('mongoose');
var config = require('../config/secrets');
var mongoConnectURL = getMongoConnectURL(config.mongodb);
mongoose.connect(mongoConnectURL);

// Start express server
var express = require('express');
var app = express();



module.exports = childProcess;
module.exports.app = app;
module.exports.mongoose = mongoose;
