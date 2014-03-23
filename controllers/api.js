var _ = require('underscore');
var config = require('../config/secrets');
var mongoose = require('mongoose');
var express = require('express');

var API = function() {
  this.config = config;
  this.mongoose = mongoose;
  this.app = express();
  mongoose.connect(this.config.db);
};

module.exports = new API();
