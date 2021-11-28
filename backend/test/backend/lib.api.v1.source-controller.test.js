var utils = require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var sourceController = require('../../lib/api/v1/source-controller')();
var Source = require('../../models/source');

describe('Source controller', function() {
  var source;

  before(function(done) {
    source = {
      nickname: 'test',
      media: 'twitter',
      keywords: 'test'
    };
    done();
  });

  describe('POST /api/v1/source', function() {
    it('should create a new source', function(done) {
      request(sourceController)
        .post('/api/v1/source')
        .send(source)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          source._id = res.body._id;
          utils.compare(res.body, source);
          done();
        });
    });
  });

  describe('GET /api/v1/source/:_id', function() {
    it('should return source', function(done) {
      request(sourceController)
        .get('/api/v1/source/' + source._id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          utils.compare(res.body, source);
          done();
        });
    });

    it('should get latest logged events', function(done) {
      // Make sure we use the correct model instance
      Source.findById(source._id, function(err, foundSource) {
        // Log a new event
        foundSource.logEvent('warning', 'This is a test', function(err) {
          request(sourceController)
            .get('/api/v1/source/' + source._id)
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              expect(res.body).to.have.property('events');
              expect(res.body).to.have.property('unreadErrorCount');
              expect(res.body.events).to.be.an.instanceof(Array);
              expect(res.body.unreadErrorCount).to.equal(1);
              source.events = res.body.events;
              source.unreadErrorCount = res.body.unreadErrorCount;
              done();
            });
        });
      });
    });
  });

  describe('PUT /api/v1/source/:_id', function() {
    it('should update source', function(done) {
      source.keywords = 'e';
      request(sourceController)
        .put('/api/v1/source/' + source._id)
        .send(source)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          utils.compare(res.body, source);
          done();
        });
    });
    it('should not allow updating source media', function(done) {
      request(sourceController)
        .put('/api/v1/source/' + source._id)
        .send({ media: 'dummy' })
        .expect(422, 'source_media_change_not_allowed', done);
    });
  });

  describe('PUT /api/v1/source/_events/:_id', function() {
    it('should reset unread error count', function(done) {
      expect(source.unreadErrorCount).to.equal(1);
      request(sourceController)
        .put('/api/v1/source/_events/' + source._id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('unreadErrorCount');
          expect(res.body.unreadErrorCount).to.equal(0);
          source.unreadErrorCount = res.body.unreadErrorCount;
          done();
        });
    });
    it('should return an empty events array', function(done) {
      request(sourceController)
        .get('/api/v1/source/' + source._id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('unreadErrorCount');
          expect(res.body.unreadErrorCount).to.equal(0);
          done();
        });
    });
  });

  describe('GET /api/v1/source', function() {
    it('should get a list of all sources', function(done) {
      request(sourceController)
        .get('/api/v1/source')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          expect(res.body).to.not.be.empty;
          utils.compare(_.findWhere(res.body, { _id: source._id }), source);
          done();
        });
    });
  });

  describe('DELETE /api/v1/source/:_id', function() {
    it('should delete source', function(done) {
      request(sourceController)
        .del('/api/v1/source/' + source._id)
        .expect(200)
        .end(function(err, res) {
          request(sourceController)
            .get('/api/v1/source/' + source._id)
            .expect(404, done);
        });
    });
  });

  describe('DELETE /api/v1/source/_all', function() {
    it('should delete all sources', function(done) {
      request(sourceController)
        .del('/api/v1/source/_all')
        .expect(200)
        .end(function(err, res) {
          request(sourceController)
            .get('/api/v1/source')
            .expect(200, [], done);
        });
    });
  });

  after(utils.expectModelsEmpty);
});
