var Report = require('./report');
var async = require('async');

var ITEMS_PER_BATCH = 10; // 10 items per batch
var BATCH_TIMEOUT = 5 * 60 * 1000 // 5 minutes

function Batch() {}

// checkout new batch
Batch.prototype.checkout = function(userId, callback) {
  async.series([
    this.releaseOld,
    this.cancel.bind(this, userId),
    this.lock.bind(this, userId),
    this.load.bind(this, userId)
  ], function(err, results) {
    if (err) return callback(err);
    callback(null, results[3]);
  });
}

// release old batches
Batch.prototype.releaseOld = function(callback) {
  var conditions = { checkedOutAt: { $lt: timeAgo(BATCH_TIMEOUT) } };
  var update = { checkedOutBy: null, checkedOutAt: null };

  Report.update(conditions, update, { multi: true }, callback);
}

// cancel batch for given user
Batch.prototype.cancel = function(userId, callback) {
  var conditions = { checkedOutBy: userId };
  var update = { checkedOutBy: null, checkedOutAt: null };

  Report.update(conditions, update, { multi: true }, callback);
},

// lock a new batch for given user
Batch.prototype.lock = function(userId, callback) {
  var conditions = {
    checkedOutAt: null,
    checkedOutBy: null,
    read: false
  };

  Report
    .find(conditions)
    .sort({storedAt: -1})
    .limit(ITEMS_PER_BATCH)
    .exec(function(err, reports) {
      if (err) return callback(err);
      var ids = reports.map(function(report) { return report._id; });
      var update = { checkedOutBy: userId, checkedOutAt: new Date() };
      Report.update({ _id: { $in: ids } }, update, { multi: true }, callback);
    }
  );
},

// load a batch for user
Batch.prototype.load = function(userId, callback) {
  var conditions = {
    checkedOutAt: { $ne: null },
    checkedOutBy: userId
  };

  Report
    .find(conditions)
    .limit(ITEMS_PER_BATCH)
    .exec(callback);
}

// helpers

function timeAgo(miliseconds) {
  var now = new Date();
  return new Date(now.getTime() - miliseconds);
}

module.exports = new Batch();