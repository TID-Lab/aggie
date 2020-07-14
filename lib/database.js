// Connects to database.

var mongoose = require('mongoose');
var config = require('../config/secrets').get();
var async = require('async');

// Find database records using pagination
var PAGE_LIMIT = 25;

mongoose.Model.findPage = function(filters, page, options, callback) {
  var model = mongoose.models[this.modelName];
  var populate;

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

  if (options.populate) {
    populate = options.populate;
    delete options.populate;
  }

  // execute count and find in parallel fashion to avoid waiting for each other
  async.parallel([
    model.countDocuments.bind(model, filters),
    function(callback) {
      var query = model.find(filters, null, options);
      if (populate) query = query.populate(populate);
      query.exec(callback);
    }
  ], function(err, results) {
    if (err) return callback(err);
    var result = { total: results[0] };
    result.results = results[1];
    callback(null, result);
  });
};

var Database = function() {
  this.mongoose = mongoose;
  this.connectURL = this.getConnectURL(config.mongodb);
  // Initialize database connection
  mongoose.connect(this.connectURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
};

Database.prototype.getConnectURL = function(config) {
  // Override secrets.json if environment variable is set
  var connectionURL = process.env.MONGO_CONNECTION_URL;
  if (!connectionURL) {
    connectionURL = 'mongodb://';
    if (config.username && config.password) {
      connectionURL += config.username + ':' + config.password + '@';
    }

    connectionURL += process.env.MONGO_HOST || config.host;
    if (process.env.MONGO_PORT) {
      connectionURL += ':' + config.port;
    } else if (config.port) connectionURL += ':' + config.port;
    db = process.env.MONGO_AGGIE_DB || config.db;
    connectionURL += '/' + db;
  }

  return connectionURL;
};

module.exports = new Database();
