'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var botMaster = require('../../lib/fetching/bot-master');
var Report = require('../../models/report');
var Source = require('../../models/source');

describe('BotMaster', function() {
  before(utils.expectModelsEmpty);

  before(function(done) {
    Source.remove({}, function(err) {
      if (err) return done(err);
      Source.create(
        { nickname: 'one', media: 'dummy', keywords: 'one' },
        { nickname: 'two', media: 'dummy', keywords: 'two' },
        done
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
      if (err) {
        return done(err);
      }
      botMaster.once('botMaster:addedBot', function() {
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
    botMaster.start(function(err) {
      if (err) return done(err);
      expect(botMaster.bots[0].enabled).to.be.true;
      expect(botMaster.bots[1].enabled).to.be.true;
      done();
    });
  });

  it('should stop all bots', function(done) {
    botMaster.start(function(err) {
      if (err) return done(err);
      botMaster.stop();
      expect(botMaster.bots[0].enabled).to.be.false;
      expect(botMaster.bots[1].enabled).to.be.false;
      done();
    });
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

  // We have to remove all the reports here for a very sneaky reason. If you run
  // this test file alone, there's no problem; no reports get created. But when
  // you use mocha to run this file and one which imports
  // '../../lib/fetching/report-writer', the bots will start adding reports to the
  // queue and they'll get saved. With enough latency, this call actually won't
  // be enough to stop these reports from interacting with other tests, as
  // this test file could exit with reports still in the queue. The moral is
  // probably that sharing state with `require` statements isn't very good for
  // modular testing.
  after(utils.wipeModels([Source, Report]));
  after(utils.expectModelsEmpty);
});
