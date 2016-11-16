// This file will be called only by logger.js
// This will write the user log object into the corresponding collection

// var database = require('./database');

var mongoose = require('mongoose');
/*
var config = require('../config/secrets').get();

var Database = function() {
  this.mongoose = mongoose;
  this.connectURL = this.getConnectURL(config.mongodb);
  // Initialize database connection
  mongoose.connect(this.connectURL);
};

Database.prototype.getConnectURL = function(config) {
  // Override secrets.json if environment variable is set
  var connectionURL = process.env.MONGO_CONNECTION_URL;
  if (!connectionURL) {
    connectionURL = 'mongodb://';
    if (config.username && config.password) {
      connectionURL += config.username + ':' + config.password + '@';
    }

    connectionURL += process.env.MONGO_HOST || config.host;
    if (process.env.MONGO_PORT) {
      connectionURL += ':' + config.port;
    } else if (config.port) connectionURL += ':' + config.port;
    db = process.env.MONGO_AGGIE_DB || config.db;
    connectionURL += '/' + db;
  }

  return connectionURL;
};

var logSchema = new mongoose.Schema({
  timestamp: Date,
  userID: String,
  action: String,
  actionRef: mongoose.Schema.Types.Mixed
});
*/
var UserLog = function() {};

console.log('about to create index');
// logSchema.index({timestamp: 1, userID: 1}, {unique: true});
console.log('defining model');
// var UserLog = mongoose.model('UserLog', logSchema);


UserLog.writeToCollection = function (logItem) {
  console.log('within writeToCollection');
  // logItem.timestamp = Date.now();
  console.log(logItem);
  // var singleLog = new UserLog(logItem);
	// call the .save function when I understand how it works.
	/*
  UserLog.create(logItem, function(err, numberAffected) {
	 if (err) {
    console.log(err);
   } else {
    console.log('Successfully added to model');
	}
  });
  */
}

module.exports = UserLog;
