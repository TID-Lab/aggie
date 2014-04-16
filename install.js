var database = require('./controllers/database');
var Report = require('./models/report');
var User = require('./models/user');
var config = require('./config/secrets');

var tasks = [];

// Enable full-text indexing for Reports
function enableIndexing(callback) {
  Report.ensureIndexes(function(err) {
    if (err) console.error(err);
    else console.log('Full-text indexing is enabled for reports.')
    callback();
  });
};
tasks.push(enableIndexing);

// Verify that an admin user exists
function createAdminUser(callback) {
  User.findOne({username: 'admin'}, function(err, user) {
    if (!user) {
      var userData = {
        provider: 'aggie',
        displayName: 'Administrator',
        email: config.adminEmail,
        username: 'admin',
        password: config.adminPassword
      };
      // Create new admin user
      User.create(userData, function(err, user) {
        if (err) console.error(err);
        else console.log('admin user created with password ' + userData.password);
        callback();
      });
    } else callback();
  });
};
tasks.push(createAdminUser);

var remaining = tasks.length;
tasks.forEach(function(task) {
  task(function() {
    if (--remaining === 0) process.exit();
  });
});
