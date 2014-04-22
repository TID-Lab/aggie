require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var fetchingController = require('../lib/api/' + API_VERSION + '/fetching-controller');
var botMaster = require('../lib/fetching/bot-master');
var Source = require('../models/source');

describe('Fetching controller', function() {
  before(function(done) {
    botMaster.kill();
    botMaster.addListeners('source', Source.schema);
    botMaster.addListeners('fetching', fetchingController);
    fetchingController.addListeners('botMaster', botMaster);
    Source.create({type: 'dummy', keywords: 'one'});
    Source.create({type: 'dummy', keywords: 'two'});
    Source.create({type: 'dummy', keywords: 'three'});
    done();
  });

  describe('GET /api/' + API_VERSION + '/fetching', function() {
    it('should return fetching status as disabled', function(done) {
      request(fetchingController)
        .get('/api/' + API_VERSION + '/fetching')
        .expect(200, {enabled: false}, done);
    });
  });

  describe('PUT /api/' + API_VERSION + '/fetching/on', function() {
    it('should enable all bots', function(done) {
      request(fetchingController)
        .put('/api/' + API_VERSION + '/fetching/on')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          // Allow time for bots to be fully started
          setTimeout(function() {
            botMaster.bots.forEach(function(bot) {
              expect(bot).to.have.property('enabled');
              expect(bot.enabled).to.be.true;
            });
            done();
          }, 100);
        });
    });
  });

  describe('GET /api/' + API_VERSION + '/fetching', function() {
    it('should return fetching status as enabled', function(done) {
      request(fetchingController)
        .get('/api/' + API_VERSION + '/fetching')
        .expect(200, {enabled: true}, done);
    });
  });

  describe('PUT /api/' + API_VERSION + '/fetching/off', function() {
    it('should disable all bots', function(done) {
      request(fetchingController)
        .put('/api/' + API_VERSION + '/fetching/off')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          // Allow time for bots to be fully stopped
          setTimeout(function() {
            botMaster.bots.forEach(function(bot) {
              expect(bot).to.have.property('enabled');
              expect(bot.enabled).to.be.false;
            });
            done();
          }, 100);
        });
    });
  });

  describe('GET /api/' + API_VERSION + '/fetching', function() {
    it('should return fetching status as disabled', function(done) {
      request(fetchingController)
        .get('/api/' + API_VERSION + '/fetching')
        .expect(200, {enabled: false}, done);
    });
  });

});
