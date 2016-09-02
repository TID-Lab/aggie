var utils = require('./init');
var expect = require('chai').expect;
var Report = require('../models/report');
var User = require('../models/user');
var batch = require('../models/batch');
var async = require('async');

var user;

// helpers
function timeAgo(miliseconds) {
  var now = new Date();
  return new Date(now.getTime() - miliseconds);
}

function loadUser(done) {
  User.findOne({}, function(err, u) {
    user = u;
    done(err);
  });
}

function createReport(done) {
  var t = new Date();

  Report.create([
    { storedAt: new Date(t.getTime() - 11000), content: 'one', flagged: true, checkedOutBy: user.id, checkedOutAt: timeAgo(6 * 1000 * 60) },
    { storedAt: new Date(t.getTime() - 12000), content: 'two', flagged: false },
    { storedAt: new Date(t.getTime() - 13000), content: 'three', flagged: false },
    { storedAt: new Date(t.getTime() - 14000), content: 'four', flagged: false },
    { storedAt: new Date(t.getTime() - 15000), content: 'five', flagged: false },
    { storedAt: new Date(t.getTime() - 16000), content: 'six', flagged: true, read: true }
  ], done);
}

describe('Report', function() {
  beforeEach(function(done) {
    async.series([loadUser, createReport], done);
  });

  afterEach(function(done) {
    Report.remove({}, done);
  });

  it('should lock a batch', function(done) {
    async.series([
      batch.lock.bind(batch, user._id),
      Report.find.bind(Report, {})
    ], function(err, result) {
      var reports = result[1];
      reports.forEach(function(report) {
        if (report.read) {
          expect(report.checkedOutAt).not.exist;
          expect(report.checkedOutBy).not.exist;
        }
        else {
          expect(report.checkedOutAt).to.exist;
          expect(report.checkedOutBy).to.exist;
        }
      });

      done();
    });
  });

  it('should release a batch lock', function(done) {
    async.series([batch.releaseOld, Report.find.bind(Report, {})], function(err, result) {
      var reports = result[1];
      reports.forEach(function(report) {
        expect(report.checkedOutAt).not.exist;
        expect(report.checkedOutBy).not.exist;
      });
      done();
    });
  });

  it('should load a batch', function(done) {
    async.series([
      batch.lock.bind(Report, user._id),
      batch.load.bind(Report, user._id)
    ], function(err, result) {
      var reports = result[1];
      expect(reports.length).to.eq(5);
      done();
    });
  });

  it('should checkout a new batch', function(done) {
    batch.checkout(user._id, function(err, reports) {
      expect(reports.length).to.eq(5);

      reports.forEach(function(report) {
        expect(report.checkedOutAt).to.exist;
        expect(report.checkedOutBy).to.exist;
      });

      done();
    });
  });

  it('should cancel batch', function(done) {
    batch.cancel(user._id, function(err, num) {
      expect(num).to.eq(1);
      done();
    });
  });

  after(utils.expectModelsEmpty);
});
