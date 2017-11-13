'use strict';

var Report = require('./report');
var async = require('async');
var _ = require('lodash');
var ReadWriteLock = require('rwlock');
var ReportQuery = require('./query/report-query');

var ITEMS_PER_BATCH = 10; // 10 items per batch
var BATCH_TIMEOUT = 5 * 60 * 1000; // 5 minutes
var lock = new ReadWriteLock();

function Batch() { /* empty constructor */ }

// checkout new batch
Batch.prototype.checkout = function(userId, query, callback) {
  async.series([
    this.releaseOld,
    this.cancel.bind(this, userId),
    this.lock.bind(this, userId, query),
    this.load.bind(this, userId)
  ], function(err, results) {
    if (err) return callback(err);
    callback(null, results[3]);
  });
};

// release old batches
Batch.prototype.releaseOld = function(callback) {
  var conditions = { checkedOutAt: { $lt: timeAgo(BATCH_TIMEOUT) } };
  var update = { checkedOutBy: null, checkedOutAt: null };

  Report.update(conditions, update, { multi: true }, callback);
};

// cancel batch for given user
Batch.prototype.cancel = function(userId, callback) {
  var conditions = { checkedOutBy: userId };
  var update = { checkedOutBy: null, checkedOutAt: null };

  Report.update(conditions, update, { multi: true }, callback);
},

// lock a new batch for given user
Batch.prototype.lock = function(userId, query, callback) {
  var filter = query instanceof ReportQuery ? query.toMongooseFilter() : {};
  filter = _.extend(filter, {
    checkedOutAt: null,
    checkedOutBy: null,
    read: false
  });

  lock.writeLock(function(release) {
    Report
      .find(filter)
      .sort({ storedAt: -1 })
      .limit(ITEMS_PER_BATCH)
      .exec(function(err, reports) {
        if (err) {
          release();
          return callback(err);
        }
        var ids = _.map(reports, '_id');
        var update = { checkedOutBy: userId, checkedOutAt: new Date() };
        Report.update({ _id: { $in: ids } }, update, { multi: true }, function() {
          release();
          callback();
        });

      });
  });
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
};

// helpers

function timeAgo(milliseconds) {
  var now = new Date();
  return new Date(now.getTime() - milliseconds);
}

module.exports = new Batch();
