'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var statsMaster = require('../../lib/analytics/stats-master');
var Report = require('../../models/report');
var Incident = require('../../models/incident');
var async = require('async');

describe('StatsMaster', function() {
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
    statsMaster.addListeners('report', Report.schema);
    statsMaster.addListeners('incident', Incident.schema);
  });

  var stats;
  beforeEach(function(done) {
    stats = new utils.EventCounter(statsMaster, 'stats');
    async.parallel([createReports, createIncidents], function(err) {
      stats.waitForEvents(3, done.bind({}, err));
    });
  });
  afterEach(function() {
    stats.kill();
  });

  afterEach(function(done) {
    async.parallel([Incident.remove.bind(Incident, {}), Report.remove.bind(Report, {})], done);
  });

  it('should have stats object', function() {
    expect(statsMaster).to.have.property('stats');
  });

  it('should count total reports', function() {
    var stats = statsMaster.stats;
    expect(stats).to.have.property('totalReports');
    expect(stats.totalReports).to.equal(3);
  });

  it('should count flagged reports', function() {
    var stats = statsMaster.stats;
    expect(stats).to.have.property('totalReportsFlagged');
    expect(stats.totalReportsFlagged).to.equal(2);
  });

  it('should count unread reports', function() {
    var stats = statsMaster.stats;
    expect(stats).to.have.property('totalReportsUnread');
    expect(stats.totalReportsUnread).to.equal(2);
  });

  it('should count total reports per minutes', function() {
    var stats = statsMaster.stats;
    expect(stats).to.have.property('totalReportsPerMinute');
    expect(stats.totalReportsPerMinute).to.equal(2);
  });

  it('should count total incidents', function() {
    var stats = statsMaster.stats;
    expect(stats).to.have.property('totalIncidents');
    expect(stats.totalIncidents).to.equal(3);
  });

  it('should count escalated incidents', function() {
    var stats = statsMaster.stats;
    expect(stats).to.have.property('totalEscalatedIncidents');
    expect(stats.totalEscalatedIncidents).to.equal(1);
  });

  it('should count all stats', function(done) {
    statsMaster.countStats('all', function(err, stats) {
      expect(stats.totalReports).to.equal(3);
      expect(stats.totalReportsFlagged).to.equal(2);
      expect(stats.totalReportsUnread).to.equal(2);
      expect(stats.totalReportsPerMinute).to.equal(2);
      expect(stats.totalIncidents).to.equal(3);
      expect(stats.totalEscalatedIncidents).to.equal(1);
      done();
    });
  });

  it('should count only reports stats', function(done) {
    statsMaster.countStats('reports', function(err, stats) {
      expect(stats.totalReports).to.equal(3);
      expect(stats.totalReportsFlagged).to.equal(2);
      expect(stats.totalReportsUnread).to.equal(2);
      expect(stats.totalReportsPerMinute).to.equal(2);
      expect(stats.totalIncidents).not.exist;
      done();
    });
  });

  it('should count only incidents', function(done) {
    statsMaster.countStats('incidents', function(err, stats) {
      expect(stats.totalIncidents).to.equal(3);
      expect(stats.totalEscalatedIncidents).to.equal(1);
      expect(stats.totalReports).not.exist;
      done();
    });
  });

  after(utils.expectModelsEmpty);
});
