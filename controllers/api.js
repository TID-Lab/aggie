var _ = require('underscore');
var config = require('../config/secrets');
var mongoose = require('mongoose');
var express = require('express');

var API = function(options) {
  if (options) this.config = _.defaults(options, config);
  else this.config = config;

  mongoose.connect('mongodb://' + this.config.mongodb.host + '/' + this.config.mongodb.db);
  this.app = express();
};

module.exports = new API();
module.exports.API = API;
