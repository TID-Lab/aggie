// This file will be called only by logger.js
// This will write the user log object into the corresponding collection
'use strict';

var database = require('./database');
var mongoose = database.mongoose;

var logSchema = new mongoose.Schema({
  timestamp: Date,
  userID: String,
  username: String,
  action: String,
  actionRef: mongoose.Schema.Types.Mixed
});

logSchema.index({ timestamp: 1, userID: 1 });
var UserLog = mongoose.model('UserLog', logSchema);

UserLog.writeToCollection = function(logItem, callback) {
  logItem.timestamp = new Date();
  var singleLog = new UserLog(logItem);
  singleLog.save(callback);
};

module.exports = UserLog;
