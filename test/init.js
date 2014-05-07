process.env.NODE_ENV = 'test';

var dbConnectURL = process.env.MONGO_CONNECTION_URL = 'mongodb://localhost/aggie-test';
var database = require('../lib/database');
var Report = require('../models/report');
var User = require('../models/user');

before(function(done) {
  // Change database before starting any test
  database.mongoose.disconnect(function() {
    database.mongoose.connect(dbConnectURL, function() {
      // Enable database-level text search
      database.mongoose.connections[0].db.admin().command({setParameter: 1, textSearchEnabled: true}, function(err, res) {
        if (err) return done(err);
        // Create admin user for testing
        User.create({provider: 'test', email: 'admin@example.com', username: 'admin', password: 'letmein'});
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
  })
});
