require('./init');
var expect = require('chai').expect;
var _ = require('underscore');
var botMaster = require('../controllers/fetching/bot-master');
var Bot = require('../controllers/fetching/bot');
var Source = require('../models/source');

describe('Bot master', function() {
  before(function(done) {
    botMaster.kill();
    Source.create({type: 'dummy', keywords: 'one'});
    Source.create({type: 'dummy', keywords: 'two'});
    Source.create({type: 'dummy', keywords: 'three'});
    done();
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
    Source.create({type: 'dummy', keywords: 'one'});
    expect(botMaster.bots).to.have.length(3);
    done();
  });

  it('should return bot instance from filtered search', function(done) {
    var filters = {sourceType: 'dummy', keywords: 'two'};
    var bot = botMaster.getBot(filters);
    expect(bot).to.be.an.instanceof(Bot);
    expect(bot.contentService.keywords).to.equal('two');
    done();
  });

  it('should start all bots', function(done) {
    expect(botMaster.bots[0].enabled).to.be.false;
    expect(botMaster.bots[1].enabled).to.be.false;
    expect(botMaster.bots[2].enabled).to.be.false;
    botMaster.start();
    expect(botMaster.bots[0].enabled).to.be.true;
    expect(botMaster.bots[1].enabled).to.be.true;
    expect(botMaster.bots[2].enabled).to.be.true;
    done();
  });

  it('should stop all bots', function(done) {
    botMaster.stop();
    expect(botMaster.bots[0].enabled).to.be.false;
    expect(botMaster.bots[1].enabled).to.be.false;
    expect(botMaster.bots[2].enabled).to.be.false;
    done();
  });

  it('should kill a single bot', function(done) {
    var length = botMaster.bots.length;
    var filters = {sourceType: 'dummy', keywords: 'two'};
    var bot = botMaster.getBot(filters);
    botMaster.kill(bot);
    expect(botMaster.bots).to.have.length(length - 1);
    var bot = botMaster.getBot(filters);
    expect(bot).to.be.undefined;
    done();
  });

  it('should kill all bots', function(done) {
    botMaster.kill();
    expect(botMaster.bots).to.be.empty;
    done();
  });

  it('should reload bots for all saved sources', function(done) {
    botMaster.loadAll(function(err) {
      if (err) return done(err);
      expect(botMaster.bots).to.not.be.empty;
      done();
    });
  });

});
