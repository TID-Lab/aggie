'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var Report = require('../../models/report');
var User = require('../../models/user');
var batch = require('../../models/batch');
var ReportQuery = require('../../models/query/report-query');
var async = require('async');
var _ = require('lodash');

var user, user2, t;

// helpers
function timeAgo(milliseconds) {
  var now = new Date();
  return new Date(now.getTime() - milliseconds);
}

function loadUser(done) {
  User.findOne({}, function(err, u) {
    user = u;
    done(err);
  });
}

function createUser2(done) {
  User.create({ provider: 'test', email: 'batch@example.com', username: 'batchTest', password: 'batchbatch' },
              function(err, u) {
                user2 = u;
                done(err);
              });
}

function removeUser2(done) {
  User.remove({ username: 'batchTest' }, function(err) {
    done(err);
  });
}

function createReports(done) {
  var reports = [];
  var totalReports = 50;

  for (var i = 0; i < totalReports; i++) {
    reports.push({ storedAt: new Date(t.getTime()), content: i });
  }
  Report.create(reports, done);
}

function createReport(done) {
  t = new Date();

  Report.create([
    { storedAt: new Date(t.getTime() - 11000), content: 'one', flagged: true,
      checkedOutBy: user.id, checkedOutAt: timeAgo(6 * 1000 * 60) },
    { storedAt: new Date(t.getTime() - 12000), content: 'two', flagged: false },
    { storedAt: new Date(t.getTime() - 13000), content: 'three', flagged: false },
    { storedAt: new Date(t.getTime() - 14000), content: 'four', flagged: false },
    { storedAt: new Date(t.getTime() - 15000), content: 'five', flagged: false },
    { storedAt: new Date(t.getTime() - 16000), content: 'six', flagged: true, read: true }
  ], done);
}

describe('Report', function() {
  beforeEach(function(done) {
    async.series([loadUser, createReport, createUser2], done);
  });

  afterEach(function(done) {
    async.series([removeUser2, function(done) {
      Report.remove({}, done);
    }], done);
  });

  it('should lock a batch', function(done) {
    async.series([
      batch.lock.bind(batch, user._id, null),
      Report.find.bind(Report, {})
    ], function(err, result) {
      var reports = result[1];
      reports.forEach(function(report) {
        if (report.read) {
          expect(report.checkedOutAt).not.exist;
          expect(report.checkedOutBy).not.exist;
        } else {
          expect(report.checkedOutAt).to.exist;
          expect(report.checkedOutBy).to.exist;
        }
      });

      done(err);
    });
  });

  it('should release a batch lock', function(done) {
    async.series([batch.releaseOld, Report.find.bind(Report, {})], function(err, result) {
      var reports = result[1];
      reports.forEach(function(report) {
        expect(report.checkedOutAt).not.exist;
        expect(report.checkedOutBy).not.exist;
      });
      done(err);
    });
  });

  it('should load a batch', function(done) {
    async.series([
      batch.lock.bind(Report, user._id, null),
      batch.load.bind(Report, user._id)
    ], function(err, result) {
      var reports = result[1];
      expect(reports.length).to.eq(5);
      done(err);
    });
  });

  it('should checkout a new batch', function(done) {
    batch.checkout(user._id, null, function(err, reports) {
      expect(reports.length).to.eq(5);

      reports.forEach(function(report) {
        expect(report.checkedOutAt).to.exist;
        expect(report.checkedOutBy).to.exist;
      });

      done(err);
    });
  });

  it('should cancel batch', function(done) {
    batch.cancel(user._id, function(err, num) {
      expect(num).to.eq(1);
      done(err);
    });
  });

  it('should not give same reports to different users', function(done) {
    createReports(function() {
      async.map([user._id, user2._id], function(user, cb) {
        batch.checkout(user, {}, cb);
      }, function(err, batches) {
        if (err) done(err);
        expect(batches[0].length).to.eq(10);
        expect(batches[1].length).to.eq(10);
        expect(_.intersection(batches[0], batches[1]).length).to.eq(0);
        done();
      });
    });
  });

  describe('should check out batch with filter', function() {
    function testCheckoutFilter(filter, resultContent, done) {
      var query = new ReportQuery(filter);
      batch.checkout(user._id, query, function(err, reports) {
        expect(_.map(reports, 'content').sort()).to.eql(resultContent.sort());
        done(err);
      });
    }

    it('by time', function(done) {
      var filter = {
        after: new Date(t.getTime() - 13500)
      };
      testCheckoutFilter(filter, ['one', 'two', 'three'], done);
    });

    it('by keyword', testCheckoutFilter.bind({}, { keywords: 'five two' },
                                             ['two', 'five']));
  });

  after(utils.expectModelsEmpty);
});
