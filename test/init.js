process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var host = process.env.MONGO_HOST || 'localhost';
var dbConnectURL = process.env.MONGO_CONNECTION_URL = 'mongodb://' + host + '/aggie-test';
var database = require('../lib/database');
var Report = require('../models/report');
var User = require('../models/user');
var Source = require('../models/source');
var Trend = require('../models/trend');
var Incident = require('../models/incident');
var expect = require('chai').expect;
var async = require('async');

before(function(done) {
  // Change database before starting any test
  database.mongoose.disconnect(function() {
    database.mongoose.connect(dbConnectURL, function() {
      // Enable database-level text search
      database.mongoose.connections[0].db.admin().command({setParameter: 1, textSearchEnabled: true}, function(err, res) {
        if (err) return done(err);
        // Create admin user for testing
        User.create({
          provider: 'test',
          email: 'admin@example.com',
          username: 'admin',
          password: 'letmein1',
          hasDefaultPassword: true,
          role: 'admin'
        });
        // Enable full-text indexing for Reports
        Report.ensureIndexes(done);
      });
    });
  });
});

// Drop test database after all tests are done
after(function(done) {
  database.mongoose.connection.db.dropDatabase(function() {
    database.mongoose.disconnect(done);
  });
});


function expectModelsEmpty(done) {
  User.find({}, function(err, results) {
    if (err) return done(err);
    expect(results).to.have.length(1);
    async.each([Report, Source, Trend, Incident], expectEmpty, done);
  });
}
module.exports = {};
module.exports.expectModelsEmpty = expectModelsEmpty;

function expectEmpty(model, done) {
  model.find({}, function(err, results) {
    if (err) return done(err);
    expect(results).to.be.empty;
    done();
  });
}

function wipeModels(models) {
  return function(done) {
    async.each(models, function(model, callback) {
      model.remove({}, callback);
    }, done);
  };
}
module.exports.wipeModels = wipeModels;

function removeUsersExceptAdmin(done) {
  var query = {
    username: { $ne: 'admin' }
  };
  User.remove(query, done);
}
module.exports.removeUsersExceptAdmin = removeUsersExceptAdmin;

// Compare object attributes
compare = function(a, b) {
  for (var attr in a) {
    if (b[attr]) {
      expect(a[attr]).to.equal(b[attr]);
    }
  }
};

// Expect listener to not emit reports
function expectToNotEmitReport(listener, done) {
  listener.once('report', function() {
    done(new Error('Should not emit reports'));
  });
}
module.exports.expectToNotEmitReport = expectToNotEmitReport;

// Expect listener to emit specific errors
expectToEmitError = function(listener, message, done) {
  listener.once('error', function(err) {
    expect(err).to.be.an.instanceof(Error);
    expect(err.message).to.contain(message);
    done();
  });
};
