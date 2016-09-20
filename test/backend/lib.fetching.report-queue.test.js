'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var reportQueue = require('../../lib/fetching/report-queue');
var botFactory = require('../../lib/fetching/bot-factory');
var botMaster = require('../../lib/fetching/bot-master');
var Source = require('../../models/source');
var Report = require('../../models/report');

describe('Report queue', function() {
  var one, two, three;

  describe('base functions', function() {
    before(function(done) {
      botMaster.kill();
      reportQueue.clear();
      one = botFactory.create(new Source({ nickname: '1', media: 'dummy', keywords: 'one' }));
      one.start();
      two = botFactory.create(new Source({ nickname: '2', media: 'dummy', keywords: 'two' }));
      two.start();
      three = botFactory.create(new Source({ nickname: '3', media: 'dummy', keywords: 'three' }));
      three.start();
      // Stream data for 100ms
      setTimeout(function() {
        done();
      }, 100);
    });

    it('should add bots to the queue', function(done) {
      expect(reportQueue._bots).to.be.an.instanceof(Array);
      expect(reportQueue._bots).to.be.empty;
      reportQueue.enqueue(one);
      reportQueue.enqueue(two);
      reportQueue.enqueue(three);
      expect(reportQueue._bots).to.have.length(3);
      done();
    });

    it('should get bots in order', function(done) {
      var bot = reportQueue.nextBot();
      expect(bot.source.nickname).to.equal('1');
      bot = reportQueue.nextBot();
      expect(bot.source.nickname).to.equal('2');
      bot = reportQueue.nextBot();
      expect(bot.source.nickname).to.equal('3');
      // Wrap around
      bot = reportQueue.nextBot();
      expect(bot.source.nickname).to.equal('1');
      done();
    });

    it('should fetch reports from each of the bots in turn', function(done) {
      expect(reportQueue.nextReport().content).to.contain('two');
      expect(reportQueue.nextReport().content).to.contain('three');
      expect(reportQueue.nextReport().content).to.contain('one');
      expect(reportQueue.nextReport().content).to.contain('two');
      expect(reportQueue.nextReport().content).to.contain('three');
      expect(reportQueue.nextReport().content).to.contain('one');
      expect(reportQueue.nextReport()).to.be.undefined;
      done();
    });

    it('should remove bots from the queue', function(done) {
      expect(reportQueue._bots).to.have.length(3);
      reportQueue.dequeue(one);
      reportQueue.dequeue(two);
      expect(reportQueue._bots).to.have.length(1);
      var bot = reportQueue.nextBot();
      expect(bot.contentService._keywords).to.equal('three');
      done();
    });
  });

  describe('bot management', function() {
    before(function(done) {
      botMaster.kill();
      botMaster.addListeners('source', Source.schema);
      reportQueue.clear();
      Source.create({ nickname: 'one', media: 'dummy', keywords: 'one' });
      Source.create({ nickname: 'two', media: 'dummy', keywords: 'two' });
      Source.create({ nickname: 'three', media: 'dummy', keywords: 'three' });
      process.nextTick(function() {
        botMaster.start();
        done();
      });
    });

    // Stream data for 100ms
    before(function(done) {
      setTimeout(function() {
        botMaster.stop();
        done();
      }, 100);
    });

    it('should have added bots to the queue', function(done) {
      reportQueue.on('notEmpty', function() {
        expect(reportQueue._bots).to.have.length(3);
      });
      done();
    });

    it('should have removed empty bots from the queue', function(done) {
      // Destroy existing circular queue in each bot
      botMaster.bots.forEach(function(bot) {
        bot.clearQueue();
      });
      expect(reportQueue._bots).to.be.empty;
      done();
    });
  });

  after(utils.wipeModels([Report, Source]));
  after(utils.expectModelsEmpty);
});
