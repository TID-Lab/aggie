var utils = require('./init');
var expect = require('chai').expect;
var StatsQueryer = require('../../backend/analytics/stats-queryer');
var Report = require('../../backend/models/report');
var Group = require('../../backend/models/group');
var async = require('async');

describe('StatsQueryer', function() {

  function createReports(done) {
    Report.create([
      { storedAt: new Date(), content: 'one', flagged: true },
      { storedAt: new Date(), content: 'two', flagged: false },
      { storedAt: new Date('2014-01-01'), content: 'three', flagged: true, read: true }
    ], done);
  }

  function createGroups(done) {
    Group.create([
      { title: 'Group 1', veracity: false, escalated: false, status: 'new' },
      { title: 'Group 2', veracity: true, escalated: false, status: 'new' },
      { title: 'Group 3', veracity: true, escalated: true, status: 'new' }
    ], done);
  }

  before(function() {
    this.statsQueryer = new StatsQueryer();
  });

  beforeEach(function(done) {
    async.parallel([createReports, createGroups], done);
  });

  afterEach(function(done) {
    async.parallel([Group.remove.bind(Group, {}), Report.remove.bind(Report, {})], done);
  });

  it('should count all stats', function(done) {
    this.statsQueryer.count('all', function(err, stats) {
      expect(stats.totalReports).to.equal(3);
      expect(stats.totalReportsFlagged).to.equal(2);
      expect(stats.totalReportsUnread).to.equal(2);
      expect(stats.totalReportsPerMinute).to.equal(2);
      expect(stats.totalGroups).to.equal(3);
      expect(stats.totalEscalatedGroups).to.equal(1);
      done();
    });
  });

  it('should count reports stats', function(done) {
    this.statsQueryer.count('reports', function(err, stats) {
      expect(stats.totalReports).to.equal(3);
      expect(stats.totalReportsFlagged).to.equal(2);
      expect(stats.totalReportsUnread).to.equal(2);
      expect(stats.totalReportsPerMinute).to.equal(2);
      expect(stats.totalGroups).not.exist;
      done();
    });
  });

  it('should count reports groups', function(done) {
    this.statsQueryer.count('groups', function(err, stats) {
      expect(stats.totalGroups).to.equal(3);
      expect(stats.totalEscalatedGroups).to.equal(1);
      expect(stats.totalReports).not.exist;
      done();
    });
  });

  it('should count reports groups', function(done) {
    this.statsQueryer.count('groups', function(err, stats) {
      expect(stats.totalGroups).to.equal(3);
      expect(stats.totalEscalatedGroups).to.equal(1);
      expect(stats.totalReports).not.exist;
      done();
    });
  });

  after(utils.expectModelsEmpty);
});
