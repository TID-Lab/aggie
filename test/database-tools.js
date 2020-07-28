'use strict';

var database = require('../lib/database');
var async = require('async');
var User = require('../models/user');
var Report = require('../models/report');
var Source = require('../models/source');
var Trend = require('../models/trend');
var Incident = require('../models/incident');
var SMTCTag = require('../models/tag');

exports.initDb = function(callback) {
  async.series([
    function(next) {
      if (database.mongoose.connection.readyState == 1) {
        database.mongoose.disconnect(next)
      } else {
        next()
      }
    },
    function(next) {
      // Change database before starting any test
      var host = process.env.MONGO_HOST || 'localhost';
      var dbConnectURL = process.env.MONGO_CONNECTION_URL = 'mongodb://' + host + '/aggie-test';
      database.mongoose.connect(dbConnectURL,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
        }, next);
    },
    function(next) {
      // Enable full-text indexing for Reports
      Report.ensureIndexes(next);
    }
  ], callback);
};

exports.wipeModels = function(models) {
  return function(done) {
    async.each(models, function(model, callback) {
      model.remove({}, callback);
    }, done);
  };
};

exports.resetDb = function(callback) {
  async.series([
    exports.wipeModels([Report, Source, Trend, Incident, User, SMTCTag]),
    function(next) {
      // Create admin user for testing
      User.create({
        provider: 'test',
        email: 'admin@example.com',
        username: 'admin',
        password: 'letmein1',
        hasDefaultPassword: true,
        role: 'admin'
      }, next);
      // Reset Incident counter
      Incident.counterReset('idnum')
    }
  ], callback);
};

// Drop test database after all tests are done
exports.disconnectDropDb = function(callback) {
  database.mongoose.connection.db.dropDatabase(function(err) {
    if (err) return callback(err);
    database.mongoose.disconnect(callback);
  });
};
