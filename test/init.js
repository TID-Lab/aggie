// Set global variable with main application path
var path = require('path');
root_path = path.join(__dirname, '..');

// Change database
before(function(done) {
  var api = require(root_path + '/controllers/api');
  api.mongoose.disconnect(function() {
    api.mongoose.connect('mongodb://localhost/aggie-test');
    done();
  });
});
