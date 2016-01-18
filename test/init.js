process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var dbConnectURL = process.env.MONGO_CONNECTION_URL = 'mongodb://localhost/aggie-test';
var database = require('../lib/database');
var Report = require('../models/report');
var User = require('../models/user');
var expect = require('chai').expect;

before(function(done) {
  // Change database before starting any test
  database.mongoose.disconnect(function() {
    database.mongoose.connect(dbConnectURL, function() {
      // Enable database-level text search
      database.mongoose.connections[0].db.admin().command({setParameter: 1, textSearchEnabled: true}, function(err, res) {
        if (err) return done(err);
        // Create admin user for testing
        User.create({provider: 'test', email: 'admin@example.com', username: 'admin', password: 'letmein', hasDefaultPassword: true, role: 'admin'});
        // Enable full-text indexing for Reports
        Report.ensureIndexes(function() {
          done();
        });
      });
    });
  });
});

// Drop test database after all tests are done
after(function(done) {
  database.mongoose.connection.db.dropDatabase(function() {
    database.mongoose.disconnect(function() {
      done();
    });
  });
});

// Compare object attributes
compare = function(a, b) {
  for (var attr in a) {
    if (b[attr]) {
      expect(a[attr]).to.equal(b[attr]);
    }
  }
};

// Expect listener to not emit reports
expectToNotEmitReport = function(listener, done) {
  listener.once('report', function(report_data) {
    done(new Error('Should not emit reports'));
  });
};

// Expect listener to emit specific errors
expectToEmitError = function(listener, message, done) {
  listener.once('error', function(err) {
    expect(err).to.be.an.instanceof(Error);
    expect(err.message).to.contain(message);
    done();
  });
};
