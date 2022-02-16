var utils = require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var trendController = require('../../lib/api/controllers/trend-controller')();
var Trend = require('../../models/trend');
var Query = require('../../models/query');
var ReportQuery = require('../../models/query/report-query');

var trend;
describe('Trend controller', function() {
  before(function(done) {
    trend = { keywords: 'test' };
    done();
  });

  describe('POST /api/controllers/trend', function() {
    it('should create a new trend', function(done) {
      request(trendController)
        .post('/api/controllers/trend')
        .send(trend)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          expect(res.body).to.have.property('_query');
          trend._id = res.body._id;
          trend._query = res.body._query;
          utils.compare(res.body, trend);
          done();
        });
    });
  });

  describe('GET /api/controllers/trend/:_id', function() {
    it('should return trend', function(done) {
      request(trendController)
        .get('/api/controllers/trend/' + trend._id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          utils.compare(res.body, trend);
          done();
        });
    });
  });

  describe('GET /api/controllers/trend', function() {
    it('should get a list of all trends', function(done) {
      // Add an additional 3 trends
      Trend.create({ _query: Query.hash(new ReportQuery({ keywords: '123' })) });
      Trend.create({ _query: Query.hash(new ReportQuery({ keywords: '456' })) });
      Trend.create({ _query: Query.hash(new ReportQuery({ keywords: '789' })) });
      setTimeout(function() {
        request(trendController)
          .get('/api/controllers/trend')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.be.an.instanceof(Array);
            expect(res.body).to.have.length(4);
            utils.compare(_.findWhere(res.body, { _id: trend._id }), trend);
            done();
          });
      }, 100);
    });
  });

  describe('PUT /api/controllers/trend/:_id/:op', function() {
    it('should disable trend', function(done) {
      Trend.schema.on('trend:disable', function(trendId) {
        expect(trendId._id).to.equal(trend._id);
        done();
      });
      request(trendController)
        .put('/api/controllers/trend/' + trend._id + '/disable')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
        });
    });
    it('should enable trend', function(done) {
      Trend.schema.on('trend:enable', function(trendId) {
        expect(trendId._id).to.equal(trend._id);
        done();
      });
      request(trendController)
        .put('/api/controllers/trend/' + trend._id + '/enable')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
        });
    });
    it('should fail when sending something else', function(done) {
      request(trendController)
        .put('/api/controllers/trend/' + trend._id + '/toggle')
        .expect(422, done);
    });
  });

  describe('DELETE /api/controllers/trend/:_id', function() {
    it('should delete trend', function(done) {
      request(trendController)
        .del('/api/controllers/trend/' + trend._id)
        .expect(200)
        .end(function(err, res) {
          request(trendController)
            .get('/api/controllers/trend/' + trend._id)
            .expect(404, done);
        });
    });
  });

  describe('DELETE /api/controllers/trend/_all', function() {
    it('should delete all trends', function(done) {
      request(trendController)
        .del('/api/controllers/trend/_all')
        .expect(200)
        .end(function(err, res) {
          request(trendController)
            .get('/api/controllers/trend')
            .expect(200, [], done);
        });
    });
  });

  after(utils.expectModelsEmpty);
});
