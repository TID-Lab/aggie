// Connects to database.
require('dotenv').config(); // Get Environment Variables from .env
var mongoose = require('mongoose');
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
  if (!process.env.DATABASE_URL) {
    console.log("There does not seem to be a value for the database connection string in DATABASE_URL");
    throw new Error("No value in DATABASE_URL for the connection string. Defaulting to mongodb://localhost:27017/aggie");
  }
  this.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/"
  this.DATABASE_NAME = process.env.DATABASE_NAME || 'aggie';

  // Initialize database connection
  mongoose.connect(this.DATABASE_URL, {
    dbName: this.DATABASE_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  mongoose.connection
      .on('open', () => {
        console.log('Mongoose connection open to database.');
      })
      .on('error', (err) => {
        console.log(`Connection error: ${err.message}\n`);
      });
};

module.exports = new Database();
