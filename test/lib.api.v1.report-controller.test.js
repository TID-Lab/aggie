require('./init');
var expect = require('chai').expect;
var request = require('supertest');
require('../lib/database');
require('../models/incident');
var reportController = require('../lib/api/v1/report-controller')();
var Report = require('../models/report');
var Source = require('../models/source');
var User = require('../models/user');
var async = require('async');
var source;
var user;
var reports;

describe('Report controller', function() {
  function createSource(done) {
    Source.create({nickname: 'test', media: 'dummy', keywords: 'e'}, function (err, src) {
      source = src;
      done();
    });
  }

  function loadUser(done) {
    User.findOne({}, function (err, u) {
      user = u;
      done();
    });
  }

  function createReports(done) {
    Report.create([
      {authoredAt: new Date(), content: 'one', _source: source._id, checkedOutBy: user.id},
      {authoredAt: new Date(), content: 'two', _source: source._id, checkedOutBy: user.id}
    ], done);
  }

  function loadReports(done) {
    Report.find({}, function (err, results) {
      reports = results;
      done();
    });
  }

  beforeEach(function(done) {
    createSource(done);
  });

  afterEach(function(done) {
    async.parallel([Report.remove.bind(Report, {}), Source.remove.bind(Source, {})], done);
  });

  describe('GET /api/v1/report', function() {

    // Create some reports.
    beforeEach(function(done){
      var past = new Date(2000,1,1,12,0,0); // Feb 1
      Report.create([
        {authoredAt: new Date(), content: 'one', flagged: true, _source: source._id},
        {authoredAt: new Date(), content: 'one', _source: source._id},
        {authoredAt: new Date(), content: 'two', _source: source._id},
        {storedAt: past, authoredAt: past, content: 'three', _source: source._id}
      ], function() { done(); });
    });

    it('should get a list of all reports', function(done) {
      request(reportController)
        .get('/api/v1/report')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.contain.property('total');
          expect(res.body).to.contain.property('results');
          expect(res.body.results).to.not.be.empty;
          expect(res.body.results).to.be.an.instanceof(Array);
          done();
        });
    });

    it('should query for reports', function(done) {
      request(reportController)
        .get('/api/v1/report?keywords=one')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.contain.property('total');
          expect(res.body).to.contain.property('results');
          expect(res.body.results.length).to.equal(2);
          expect(res.body.results[0].content).to.equal('one');
          done();
        });
    });

    it('should query and filter reports', function(done) {
      request(reportController)
        .get('/api/v1/report?keywords=one&flagged=true')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.results.length).to.equal(2);
          expect(res.body.results[0].content).to.equal('one');
          done();
        });
    });

    it('should query and filter reports with no results', function(done) {
      request(reportController)
        .get('/api/v1/report?keywords=seven&read=true')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.total).to.equal(0);
          expect(res.body.results).to.be.empty;
          done();
        });
    });

    it('should filter by date range', function(done) {
      request(reportController)
        .get('/api/v1/report?after=' + new Date(2000,0,31,12,0,0) + '&before=' + new Date(2000,1,2,12,0,0))
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.results.length).to.equal(1);
          expect(res.body.results[0].content.toLowerCase()).to.contain('three');
          done();
        });
    });
  });

  describe('PUT /api/v1/report/:_id', function() {
    
    var report1 = null;
    var report2 = null;

    // Create some reports.
    beforeEach(function(done){
      var past = new Date(2000,1,1,12,0,0); // Feb 1
      Report.create([
        {authoredAt: new Date(), content: 'one', flagged: true, _source: source._id},
        {authoredAt: new Date(), content: 'one', read: false, _source: source._id}
      ], function(err, item1, item2) { 
        report1 = item1, report2 = item2;
        done(); 
      });
    });

    it('should update the specified report', function(done) {
      var data = {flagged: false, read: true};
      request(reportController)
        .put('/api/v1/report/' + report1._id)
        .send(data)
        .expect(200)
        .end(function(err) {
          if (err) return done(err);
          
          request(reportController)
          .get('/api/v1/report/' + report1._id)
          .expect(200)
          .end(function(err, res) {
            expect(res.body).to.have.property('flagged');
            expect(res.body).to.have.property('read');
            expect(res.body.flagged).to.equal(false);
            expect(res.body.read).to.equal(true);
            done();
          });
        });
    });

    it('should update multiple reports in one go', function(done) {
      var data = [
        {_id: report1._id, flagged: false, read: true},
        {_id: report2._id, flagged: true, _incident: '54c73024ae04d1f9c3a678d6'},
      ];
      request(reportController)
        .put('/api/v1/report/')
        .send(data)
        .expect(200)
        .end(function(err) {
          if (err) return done(err);
          
          request(reportController)
          .get('/api/v1/report/' + report1._id)
          .expect(200)
          .end(function(err, res) {
            expect(res.body).to.have.property('flagged');
            expect(res.body).to.have.property('read');
            expect(res.body.flagged).to.equal(false);
            expect(res.body.read).to.equal(true);
            
            request(reportController)
            .get('/api/v1/report/' + report2._id)
            .expect(200)
            .end(function(err, res) {
              expect(res.body).to.have.property('flagged');
              expect(res.body).to.have.property('_incident');
              expect(res.body.flagged).to.equal(true);
              expect(res.body._incident).to.equal('54c73024ae04d1f9c3a678d6');
              done();
            });
          });
        });
    });
  });

  describe('DELETE /api/v1/report/_all', function() {
    beforeEach(function(done) {
      Report.create([
        {authoredAt: new Date(), content: 'one', _source: source._id},
        {authoredAt: new Date(), content: 'two', _source: source._id}
      ], function() { done(); });
    });

    it('should delete all reports', function(done) {
      request(reportController)
        .del('/api/v1/report/_all')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          request(reportController)
            .get('/api/v1/report')
            .expect(200, {total: 0, results: []}, done);
        });
    });
  });

  describe('PATCH api/v1/report/_read', function() {
    beforeEach(function(done) {
      async.series([loadUser, createReports, loadReports], done);
    });

    it('should mark reports as read', function(done) {
      request(reportController)
        .patch('/api/v1/report/_read')
        .send({ids: [reports[0].id, reports[1].id], read: true})
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

});
