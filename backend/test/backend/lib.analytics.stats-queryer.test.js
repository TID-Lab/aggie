var utils = require('./init');
var expect = require('chai').expect;
var StatsQueryer = require('../../lib/analytics/stats-queryer');
var Report = require('../../models/report');
var Incident = require('../../models/incident');
var async = require('async');

describe('StatsQueryer', function() {

  function createReports(done) {
    Report.create([
      { storedAt: new Date(), content: 'one', flagged: true },
      { storedAt: new Date(), content: 'two', flagged: false },
      { storedAt: new Date('2014-01-01'), content: 'three', flagged: true, read: true }
    ], done);
  }

  function createIncidents(done) {
    Incident.create([
      { title: 'Incident 1', veracity: false, escalated: false, status: 'new' },
      { title: 'Incident 2', veracity: true, escalated: false, status: 'new' },
      { title: 'Incident 3', veracity: true, escalated: true, status: 'new' }
    ], done);
  }

  before(function() {
    this.statsQueryer = new StatsQueryer();
  });

  beforeEach(function(done) {
    async.parallel([createReports, createIncidents], done);
  });

  afterEach(function(done) {
    async.parallel([Incident.remove.bind(Incident, {}), Report.remove.bind(Report, {})], done);
  });

  it('should count all stats', function(done) {
    this.statsQueryer.count('all', function(err, stats) {
      expect(stats.totalReports).to.equal(3);
      expect(stats.totalReportsFlagged).to.equal(2);
      expect(stats.totalReportsUnread).to.equal(2);
      expect(stats.totalReportsPerMinute).to.equal(2);
      expect(stats.totalIncidents).to.equal(3);
      expect(stats.totalEscalatedIncidents).to.equal(1);
      done();
    });
  });

  it('should count reports stats', function(done) {
    this.statsQueryer.count('reports', function(err, stats) {
      expect(stats.totalReports).to.equal(3);
      expect(stats.totalReportsFlagged).to.equal(2);
      expect(stats.totalReportsUnread).to.equal(2);
      expect(stats.totalReportsPerMinute).to.equal(2);
      expect(stats.totalIncidents).not.exist;
      done();
    });
  });

  it('should count reports incidents', function(done) {
    this.statsQueryer.count('incidents', function(err, stats) {
      expect(stats.totalIncidents).to.equal(3);
      expect(stats.totalEscalatedIncidents).to.equal(1);
      expect(stats.totalReports).not.exist;
      done();
    });
  });

  it('should count reports incidents', function(done) {
    this.statsQueryer.count('incidents', function(err, stats) {
      expect(stats.totalIncidents).to.equal(3);
      expect(stats.totalEscalatedIncidents).to.equal(1);
      expect(stats.totalReports).not.exist;
      done();
    });
  });

  after(utils.expectModelsEmpty);
});
