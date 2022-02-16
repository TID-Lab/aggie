// Connects to database.

var mongoose = require('mongoose');
require('dotenv').config();
var async = require('async');
var _ = require('underscore');

// Find database records using pagination.
// Note: This should be the same as `perPage` in config.js.
var PAGE_LIMIT = 25;

mongoose.Model.findPage = function(filters, page, options, callback) {
  var model = mongoose.models[this.modelName];
  var populate;
  var countFunction

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

  // DO NOT REMOVE: substantially improves Aggie performance
  if (_.isEmpty(filters)) {
    countFunction = model.estimatedDocumentCount.bind(model, {})
  } else {
    countFunction = model.countDocuments.bind(model, filters)
  }

  // execute count and find in parallel fashion to avoid waiting for each other
  async.parallel([
    countFunction,
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
  this.connectURL = this.getConnectURL();
  // Initialize database connection
  mongoose.connect(this.connectURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
};

Database.prototype.getConnectURL = function() {
  // Override secrets.json if environment variable is set
  var connectionURL = process.env.MONGO_URL;
  if (!connectionURL) {
    console.error("Please add a field in the .env file that is equal to MONGO_CONNECTION_URL");
  }
  return connectionURL;
};

module.exports = new Database();
