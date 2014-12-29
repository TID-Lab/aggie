require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var botMaster = require('../lib/fetching/bot-master');
var Bot = require('../lib/fetching/bot');
var Source = require('../models/source');

describe('BotMaster', function() {

  before(function(done){
    Source.remove({}, function(){
      Source.create(
        {nickname: 'one', type: 'dummy', keywords: 'one'},
        {nickname: 'two', type: 'dummy', keywords: 'two'},
        function(err){ done(err); }
      );
    });
  });

  beforeEach(function(done) {
    botMaster.kill();
    Source.schema.removeAllListeners('source:save');
    Source.schema.removeAllListeners('source:remove');
    Source.schema.removeAllListeners('source:enable');
    Source.schema.removeAllListeners('source:disable');
    botMaster.init(function() {
      botMaster.addListeners('source', Source.schema);
      done();
    });
  });

  it('should track all instantiated bots', function(done) {
    expect(botMaster.bots).to.have.length(2);
    done();
  });

  it('should reload bot properly on change', function(done) {
    expect(botMaster.bots).to.have.length(2);
    // Change the source to force reload.
    Source.findOne({}, function(err, source) {
      botMaster.once('botMaster:addedBot', function(){
        expect(botMaster.bots).to.have.length(2);
        expect(botMaster._getBot(source._id).source.keywords).to.equal('foo');
        done();
      });
      source.keywords = 'foo';
      source.save();
    });
  });

  it('should start all bots', function(done) {
    expect(botMaster.bots[0].enabled).to.be.false;
    expect(botMaster.bots[1].enabled).to.be.false;
    botMaster.start();
    expect(botMaster.bots[0].enabled).to.be.true;
    expect(botMaster.bots[1].enabled).to.be.true;
    done();
  });

  it('should stop all bots', function(done) {
    botMaster.start();
    botMaster.stop();
    expect(botMaster.bots[0].enabled).to.be.false;
    expect(botMaster.bots[1].enabled).to.be.false;
    done();
  });

  it('should kill a single bot', function(done) {
    var sourceId = botMaster.bots[1].source._id;
    botMaster.kill(botMaster._getBot(sourceId));
    expect(botMaster.bots).to.have.length(1);
    expect(botMaster._getBot(sourceId)).to.be.undefined;
    done();
  });

  it('should kill all bots', function(done) {
    botMaster.kill();
    expect(botMaster.bots).to.be.empty;
    done();
  });
});
