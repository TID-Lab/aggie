var _ = require('underscore');
var config = require('../config/secrets');
var mongoose = require('mongoose');
var express = require('express');

var API = function() {
  this.config = config;
  this.mongoose = mongoose;
  this.app = express();
  mongoose.connect('mongodb://' + this.config.mongodb.host + '/' + this.config.mongodb.db);
};

module.exports = new API();
