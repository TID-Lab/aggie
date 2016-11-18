'use strict';

var database = require('../lib/database');
var async = require('async');
var User = require('../models/user');
var Report = require('../models/report');
var Source = require('../models/source');
var Trend = require('../models/trend');
var Incident = require('../models/incident');
var autoIncrement = require('mongoose-auto-increment');

exports.initDb = function(callback) {
  async.series([
    function(next) {
      database.mongoose.disconnect(next);
    },
    function(next) {
      // Change database before starting any test
      var host = process.env.MONGO_HOST || 'localhost';
      var dbConnectURL = process.env.MONGO_CONNECTION_URL = 'mongodb://' + host + '/aggie-test';
      database.mongoose.connect(dbConnectURL, next);
    },
    function(next) {
      // Enable database-level text search
      database.mongoose.connections[0].db.admin().command({
        setParameter: 1,
        textSearchEnabled: true
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
    exports.wipeModels([Report, Source, Trend, Incident, User]),
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
      // Recreate identitycounters collection
      autoIncrement.initialize(database.mongoose.connection);
      Incident.schema.plugin(autoIncrement.plugin, { model: 'Incident', field: 'idnum', startAt: 1 });
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
