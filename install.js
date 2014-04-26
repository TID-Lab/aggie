var database = require('./lib/database');
var Report = require('./models/report');
var User = require('./models/user');
var config = require('./config/secrets');

var tasks = [];

// Enable full-text indexing for Reports
function enableIndexing(callback) {
  // Wait for database connection
  setTimeout(function() {
    // Enable database-level text search
    database.mongoose.connections[0].db.admin().command({setParameter: 1, textSearchEnabled: true}, function(err, res) {
      if (err) console.error(err);
      else console.log('Text search has been enabled for MongoDB.');
      Report.ensureIndexes(function(err) {
        if (err) console.error(err);
        else console.log('Full-text indexing is enabled for Reports.')
        callback();
      });
    });
  }, 1000);
};
tasks.push(enableIndexing);

// Verify that an admin user exists
function createAdminUser(callback) {
  User.findOne({username: 'admin'}, function(err, user) {
    if (!user) {
      var userData = {
        provider: 'aggie',
        email: config.email.from,
        username: 'admin',
        password: config.adminPassword
      };
      // Create new admin user
      User.create(userData, function(err, user) {
        if (err) console.error(err);
        else console.log('"admin" user created with password "' + config.adminPassword + '"');
        callback();
      });
    } else {
      if (config.email.from) user.email = config.email.from;
      if (config.adminPassword) user.password = config.adminPassword;
      user.save(function(err) {
        if (err) console.error(err);
        else console.log('"admin" user updated with password "' + config.adminPassword + '"');
        callback();
      });
    }
  });
};
tasks.push(createAdminUser);

var remaining = tasks.length;
tasks.forEach(function(task) {
  task(function() {
    if (--remaining === 0) process.exit();
  });
});
