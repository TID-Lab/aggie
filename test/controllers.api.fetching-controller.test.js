require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var fetchingController = require('../controllers/api/fetching-controller');
var botMaster = require('../controllers/fetching/bot-master');
var Source = require('../models/source');

describe('Fetching controller', function() {
  before(function(done) {
    botMaster.kill();
    Source.create({type: 'dummy', keywords: 'one'});
    Source.create({type: 'dummy', keywords: 'two'});
    Source.create({type: 'dummy', keywords: 'three'});
    done();
  });

  describe('GET /api/fetching', function() {
    it('should return fetching status as disabled', function(done) {
      request(fetchingController)
        .get('/api/fetching')
        .expect(200, {enabled: false}, done);
    });
  });

  describe('PUT /api/fetching/on', function() {
    it('should enable all bots', function(done) {
      request(fetchingController)
        .put('/api/fetching/on')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          botMaster.bots.forEach(function(bot) {
            expect(bot).to.have.property('enabled');
            expect(bot.enabled).to.be.true;
          });
          done();
        });
    });
  });

  describe('GET /api/fetching', function() {
    it('should return fetching status as enabled', function(done) {
      request(fetchingController)
        .get('/api/fetching')
        .expect(200, {enabled: true}, done);
    });
  });

  describe('PUT /api/fetching/off', function() {
    it('should disable all bots', function(done) {
      request(fetchingController)
        .put('/api/fetching/off')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          botMaster.bots.forEach(function(bot) {
            expect(bot).to.have.property('enabled');
            expect(bot.enabled).to.be.false;
          });
          done();
        });
    });
  });

  describe('GET /api/fetching', function() {
    it('should return fetching status as disabled', function(done) {
      request(fetchingController)
        .get('/api/fetching')
        .expect(200, {enabled: false}, done);
    });
  });

});
