require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var settingsController = require('../lib/api/v1/settings-controller');
var botMaster = require('../lib/fetching/bot-master');
var Source = require('../models/source');
var config = require('../config/secrets');
var _ = require('underscore');

describe('Settings controller', function() {
  before(function(done) {
    botMaster.kill();
    botMaster.addListeners('source', Source.schema);
    botMaster.addListeners('fetching', settingsController);

    Source.create({nickname: 'one', media: 'dummy', keywords: 'one'});
    Source.create({nickname: 'two', media: 'dummy', keywords: 'two'});
    Source.create({nickname: 'three', media: 'dummy', keywords: 'three'});

    twitterSettings =  _.clone(config.get().twitter);
    testSettings = {
      consumer_key: 'testing',
      consumer_secret: 'test',
      access_token: 'api',
      access_token_secret: 'error',
      configured: false,
      on: false,
    };

    config.updateFetching(false, function(err) {
      done();
    });
  });

  describe('GET /api/v1/settings/twitter', function() {
    it('should return the settings JSON of twitter', function(done) {
      request(settingsController)
        .get('/api/v1/settings/twitter')
        .expect(200, {twitter: config.get({ reload: true }).twitter, setting: 'twitter' }, done);
    });
  });

  describe('POST /api/v1/settings/media/twitter/test', function() {

    it('should test the settings of twitter', function(done) {
      request(settingsController)
        .post('/api/v1/settings/media/twitter/test')
        .send({ settings: testSettings })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.success).to.be.false;
          return done();
        });
    });

    it('should not change the settings of twitter ', function(done) {
      request(settingsController)
        .post('/api/v1/settings/media/twitter/test')
        .send({ settings: testSettings })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(_.clone(config.get({ reload: true }).twitter)).to.deep.equal(twitterSettings);
          return done();
        });
    });
  });

  describe('PUT /api/v1/settings/twitter', function() {
    it('should update twitter settings', function(done) {

      request(settingsController)
        .put('/api/v1/settings/twitter')
        .send({ settings: testSettings })
        .end(function(err, res) {
          if (err) return done(err);
          var newSettings = config.get({ reload: true }).twitter;
          expect(newSettings).to.deep.equal(testSettings);
          return done();
        });
    });

    after(function(done) {

      // Revert changes to settings
      request(settingsController)
        .put('/api/v1/settings/media/twitter')
        .send({ settings: twitterSettings })
        .end(function(err, res) {});

      done();
    });
  });

  describe('GET /api/v1/settings/fetching', function() {
    it('should return fetching status as disabled', function(done) {
      request(settingsController)
        .get('/api/v1/settings/fetching')
        .expect(200, {fetching: false, setting: 'fetching' }, done);
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
        .expect(200, {fetching: true, setting: 'fetching'}, done);
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
        .expect(200, {fetching: false, setting: 'fetching'}, done);
    });
  });

});
