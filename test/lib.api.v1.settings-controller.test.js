require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var settingsController = require('../lib/api/v1/settings-controller');
var botMaster = require('../lib/fetching/bot-master');
var Source = require('../models/source');

describe('Settings controller', function() {
  before(function(done) {
    botMaster.kill();
    botMaster.addListeners('source', Source.schema);
    botMaster.addListeners('fetching', settingsController);
    
    Source.create({nickname: 'one', media: 'dummy', keywords: 'one'});
    Source.create({nickname: 'two', media: 'dummy', keywords: 'two'});
    Source.create({nickname: 'three', media: 'dummy', keywords: 'three'});
    
    var config = require('../config/secrets');
    config.updateFetching(false, function(err){
      done();
    });
  });

  describe('GET /api/v1/settings/fetching', function() {
    it('should return fetching status as disabled', function(done) {
      request(settingsController)
        .get('/api/v1/settings/fetching')
        .expect(200, {enabled: false}, done);
    });
  });

  describe('PUT /api/v1/settings/fetching/on', function() {
    it('should enable all bots', function(done) {
      request(settingsController)
        .put('/api/v1/settings/fetching/on')
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

  describe('GET /api/v1/settings/fetching', function() {
    it('should return fetching status as enabled', function(done) {
      request(settingsController)
        .get('/api/v1/settings/fetching')
        .expect(200, {enabled: true}, done);
    });
  });

  describe('PUT /api/v1/settings/fetching/off', function() {
    it('should disable all bots', function(done) {
      request(settingsController)
        .put('/api/v1/settings/fetching/off')
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

  describe('GET /api/v1/settings/fetching', function() {
    it('should return fetching status as disabled', function(done) {
      request(settingsController)
        .get('/api/v1/settings/fetching')
        .expect(200, {enabled: false}, done);
    });
  });

});
