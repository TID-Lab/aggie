process.title = 'aggie-setup';
// Performs some basic setup tasks. Should be run as part of deploy process.
var database = require('./backend/database');
var Report = require('./backend/models/report');
var User = require('./backend/models/user');
require('dotenv').config();
var tasks = [];

// Enable full-text indexing for Reports
function enableIndexing(callback) {
  // Wait for database connection
  database.mongoose.connection.on('error', function(err) {
    console.error('mongoose connection error (retrying): ', err);
    setTimeout(function() {
      database.mongoose.connect(database.DATABASE_URL,
        {
          dbName: database.DATABASE_NAME,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
        });
    }, 200);
  });
  database.mongoose.connection.once('open', function() {
    Report.ensureIndexes(function(err) {
      if (err) console.error(err);
      else console.log('Indexing is enabled for Reports.');
      callback();
    });
  });
}
tasks.push(enableIndexing);

// Verify that an admin user exists
const createAdminUser = (callback) => {
  User.findOne({ role: 'admin' }, function(err, user) {
    if (!user) {
      User.register({
        username:'username',
        email: process.env.ADMIN_EMAIL,
        username: 'admin',
        role: 'admin',
        hasDefaultPassword: 'true',
      }, process.env.ADMIN_PASSWORD, function(err, user) {
        if (err) {console.error(err)}
        else console.log('"admin" user created with password "' + process.env.ADMIN_PASSWORD + '"');
        callback();
      });
    } else callback();
  });
}
tasks.push(createAdminUser);

var remaining = tasks.length;
tasks.forEach(function(task) {
  task(function() {
    if (--remaining === 0) process.exit();
  });
});
