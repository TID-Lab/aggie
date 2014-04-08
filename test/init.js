var dbConnectURL = process.env.MONGO_CONNECTION_URL = 'mongodb://localhost/aggie-test';
var database = require('../controllers/database');

// Change database before starting any test
before(function(done) {
  database.mongoose.disconnect(function() {
    database.mongoose.connect(dbConnectURL);
    done();
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
