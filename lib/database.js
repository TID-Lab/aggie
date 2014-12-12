// Connects to database.

var mongoose = require('mongoose');
var config = require('../config/secrets');

// Find database records using pagination
var PAGE_LIMIT = 25;
mongoose.Model.findPage = function(filters, page, options, callback) {
  var model = mongoose.models[this.modelName];

  if (typeof filters === 'function') {
    callback = filters;
    options = {};
    page = 0;
    filters = {};
  } else if (typeof page === 'function') {
    callback = page;
    options = {};
    page = 0;
  } else if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (page < 0) page = 0;
  options = options || {};
  options.limit = PAGE_LIMIT;
  options.skip = page * PAGE_LIMIT;

  model.count(filters, function(err, count) {
    if (err) return callback(err);
    var result = {total: count};
    model.find(filters, null, options, function(err, results) {
      if (err) return callback(err);
      result.results = results;
      callback(null, result);
    });
  });
};

var Database = function() {
  this.mongoose = mongoose;
  this.connectURL = this.getConnectURL(config.mongodb);
  // Initialize database connection
  mongoose.connect(this.connectURL);
};

Database.prototype.getConnectURL = function(config) {
  // Override secrets.json if environment variable is set
  var connectionURL = process.env.MONGO_CONNECTION_URL;
  if (!connectionURL) {
    connectionURL = 'mongodb://';
    if (config.username && config.password) {
      connectionURL += config.username + ':' + config.password + '@';
    }
    connectionURL += config.host;
    if (config.port) connectionURL += ':' + config.port;
    connectionURL += '/' + config.db;
  }
  return connectionURL;
};

module.exports = new Database();
