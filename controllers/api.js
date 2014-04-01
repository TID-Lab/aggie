var childProcess = require('./child-process');

// Initialize database connection
var mongoose = require('mongoose');
var config = require('../config/secrets');
mongoose.connect('mongodb://' + config.mongodb.host + '/' + config.mongodb.db);

// Start express server
var express = require('express');
var app = express();

module.exports = childProcess;
module.exports.app = app;
module.exports.mongoose = mongoose;
