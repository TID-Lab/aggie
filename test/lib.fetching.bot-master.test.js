require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var botMaster = require('../lib/fetching/bot-master');
var Bot = require('../lib/fetching/bot');
var Source = require('../models/source');

describe('Bot master', function() {
  before(function(done) {
    botMaster.kill();
    botMaster.addListeners('source', Source.schema);
    process.nextTick(function() {
      Source.create({nickname: 'one', type: 'dummy', keywords: 'one'});
      Source.create({nickname: 'two', type: 'dummy', keywords: 'two'});
      Source.create({nickname: 'three', type: 'dummy', keywords: 'three'});
      setTimeout(function() {
        done();
      }, 500);
    });
  });

  it('should track all instantiated bots', function(done) {
    expect(botMaster.bots).to.have.length(3);
    expect(botMaster.bots[0]).to.be.an.instanceof(Bot);
    expect(botMaster.bots[1]).to.be.an.instanceof(Bot);
    expect(botMaster.bots[2]).to.be.an.instanceof(Bot);
    done();
  });

  it('should avoid duplicate bots', function(done) {
    expect(botMaster.bots).to.have.length(3);
    Source.create({nickname: 'one', type: 'dummy', keywords: 'one'});
    expect(botMaster.bots).to.have.length(3);
    done();
  });

  it('should return bot instance from a source ID', function(done) {
    var sourceId = botMaster.bots[1].source._id;
    var keywords = botMaster.bots[1].contentService.keywords;
    var bot = botMaster.getBot(sourceId);
    expect(bot).to.be.an.instanceof(Bot);
    expect(bot.contentService.keywords).to.equal(keywords);
    done();
  });

  it('should start all bots', function(done) {
    expect(botMaster.bots[0].enabled).to.be.false;
    expect(botMaster.bots[1].enabled).to.be.false;
    expect(botMaster.bots[2].enabled).to.be.false;
    botMaster.start();
    setTimeout(function() {
      expect(botMaster.bots[0].enabled).to.be.true;
      expect(botMaster.bots[1].enabled).to.be.true;
      expect(botMaster.bots[2].enabled).to.be.true;
      done();
    }, 100);
  });

  it('should stop all bots', function(done) {
    botMaster.stop();
    // Allow some time for bots to be fully stopped
    setTimeout(function() {
      expect(botMaster.bots[0].enabled).to.be.false;
      expect(botMaster.bots[1].enabled).to.be.false;
      expect(botMaster.bots[2].enabled).to.be.false;
      done();
    }, 100);
  });

  it('should kill a single bot', function(done) {
    var length = botMaster.bots.length;
    var sourceId = botMaster.bots[1].source._id;
    var bot = botMaster.getBot(sourceId);
    botMaster.kill(bot);
    expect(botMaster.bots).to.have.length(length - 1);
    var bot = botMaster.getBot(sourceId);
    expect(bot).to.be.undefined;
    done();
  });

  it('should reload a bot', function(done) {
    var sourceId = botMaster.bots[0].source._id;
    var bot = botMaster.getBot(sourceId);
    Source.findById(sourceId, function(err, source) {
      if (err) return done(err);
      expect(source).to.be.an.instanceof(Source);
      source.keywords = 'four';
      source.save(function(err, source, numberAffected) {
        if (err) return done(err);
        expect(numberAffected).to.equal(1);
        expect(source).to.be.an.instanceof(Source);
        setTimeout(function() {
          var bot = botMaster.getBot(sourceId);
          expect(bot).to.have.property('contentService');
          expect(bot.contentService).to.have.property('keywords');
          expect(bot.contentService.keywords).to.equal('four');
          done();
        }, 100);
      });
    });
  });

  it('should kill all bots', function(done) {
    botMaster.kill();
    expect(botMaster.bots).to.be.empty;
    done();
  });

  it('should reload bots for all saved sources', function(done) {
    botMaster.loadAll(function(err) {
      if (err) return done(err);
      setTimeout(function() {
        expect(botMaster.bots).to.not.be.empty;
        done();
      }, 100);
    });
  });

});
