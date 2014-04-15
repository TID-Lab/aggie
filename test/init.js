process.env.NODE_ENV = 'test';

var dbConnectURL = process.env.MONGO_CONNECTION_URL = 'mongodb://localhost/aggie-test';
var database = require('../controllers/database');
var Report = require('../models/report');

// Change database before starting any test
before(function(done) {
  database.mongoose.disconnect(function() {
    database.mongoose.connect(dbConnectURL);
    // Enable full-text indexing for Reports
    Report.ensureIndexes(function() {
      done();
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
