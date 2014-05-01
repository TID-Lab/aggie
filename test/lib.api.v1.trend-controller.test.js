require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var trendController = require('../lib/api/v1/trend-controller')();
var Trend = require('../models/trend');
var Query = require('../models/query');

var trend;
describe('Trend controller', function() {
  before(function(done) {
    var query = new Query({type: 'Report', keywords: 'test'});
    trend = {
      _query: query._id.toString()
    };
    done();
  });

  describe('POST /api/v1/trend', function() {
    it('should create a new trend', function(done) {
      request(trendController)
        .post('/api/v1/trend')
        .send(trend)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          // Store resulting object
          trend = _.extend(trend, _.omit(res.body, ['__v', 'counts']));
          compare.call(this, res.body, trend);
          done();
        });
    });
  });

  describe('GET /api/v1/trend/:_id', function() {
    it('should return trend', function(done) {
      request(trendController)
        .get('/api/v1/trend/' + trend._id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          compare.call(this, res.body, trend);
          done();
        });
    });
  });

  describe('PUT /api/v1/trend/:_id/:op', function() {
    it('should disable trend', function(done) {
      request(trendController)
        .put('/api/v1/trend/' + trend._id + '/disable')
        .expect(200, done);
    });
    it('should enable trend', function(done) {
      request(trendController)
        .put('/api/v1/trend/' + trend._id + '/enable')
        .expect(200, done);
    });
    it('should fail when sending something else', function(done) {
      request(trendController)
        .put('/api/v1/trend/' + trend._id + '/toggle')
        .expect(403, done);
    });
  });

  describe('GET /api/v1/trend', function() {
    it('should get a list of all trends', function(done) {
      request(trendController)
        .get('/api/v1/trend')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          expect(res.body).to.not.be.empty;
          compare(_.findWhere(res.body, {_id: trend._id}), trend);
          done();
        });
    });
  });

  describe('DELETE /api/v1/trend/:_id', function() {
    it('should delete trend', function(done) {
      request(trendController)
        .del('/api/v1/trend/' + trend._id)
        .expect(200)
        .end(function(err, res) {
          request(trendController)
            .get('/api/v1/trend/' + trend._id)
            .expect(404, done);
        });
    });
  });

  describe('DELETE /api/v1/trend/_all', function() {
    it('should delete all trends', function(done) {
      request(trendController)
        .del('/api/v1/trend/_all')
        .expect(200)
        .end(function(err, res) {
          request(trendController)
            .get('/api/v1/trend')
            .expect(200, [], done);
        });
    });
  });

});

var compare = function(a, b) {
  for (var attr in a) {
    if (b[attr]) {
      expect(a[attr]).to.equal(b[attr]);
    }
  }
}
