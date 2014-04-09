var mongoose = require('mongoose');
var config = require('../config/secrets');

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
