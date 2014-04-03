// Set global variable with main application path
var path = require('path');
root_path = path.join(__dirname, '..');

var api = require(root_path + '/controllers/api');

// Change database before starting any test
before(function(done) {
  api.mongoose.disconnect(function() {
    api.mongoose.connect('mongodb://localhost/aggie-test');
    done();
  });
});

// Drop test database after all tests are done
after(function(done) {
  api.mongoose.connection.db.dropDatabase(function() {
    api.mongoose.disconnect(function() {
      done();
    });
  })
});
