var config = require('../config/secrets');
var mongoose = require('mongoose');

mongoose.connect('mongodb://' + config.mongodb.host + '/' + config.mongodb.db);

var express = require('express');
var app = express();

module.exports = app;
