'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var Report = require('../../models/report');
var User = require('../../models/user');
var batch = require('../../models/batch');
var ReportQuery = require('../../models/query/report-query');
var async = require('async');
var _ = require('lodash');

var user, t;

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
    async.series([loadUser, createReport], done);
  });

  afterEach(function(done) {
    Report.remove({}, done);
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
