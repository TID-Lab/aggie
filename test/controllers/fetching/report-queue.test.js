var expect = require('chai').expect;
var reportQueue = require(root_path + '/controllers/fetching/report-queue');
var reportWriter = require(root_path + '/controllers/fetching/report-writer');
var botFactory = require(root_path + '/controllers/fetching/bot-factory');
var botMaster = require(root_path + '/controllers/fetching/bot-master');
var CircularQueue = require(root_path + '/controllers/fetching/circular-queue');
var Report = require(root_path + '/models/report');
var Source = require(root_path + '/models/source');

describe('Report queue', function() {

  describe('base functions', function() {
    before(function(done) {
      botMaster.kill();
      reportQueue.clear();
      one = botFactory.create({sourceType: 'dummy', keywords: '1', interval: 0});
      one.start();
      two = botFactory.create({sourceType: 'dummy', keywords: '2', interval: 0});
      two.start();
      three = botFactory.create({sourceType: 'dummy', keywords: '3', interval: 0});
      three.start();
      done();
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
      expect(bot.contentService.keywords).to.equal('1');
      var bot = reportQueue.nextBot();
      expect(bot.contentService.keywords).to.equal('2');
      var bot = reportQueue.nextBot();
      expect(bot.contentService.keywords).to.equal('3');
      // Wrap around
      var bot = reportQueue.nextBot();
      expect(bot.contentService.keywords).to.equal('1');
      done();
    });

    it('should fetch reports from each of the bots in turn', function(done) {
      var report_data = reportQueue.nextReport();
      expect(report_data.content).to.contain('2');
      var report_data = reportQueue.nextReport();
      expect(report_data.content).to.contain('3');
      // Wrap around, last one
      var report_data = reportQueue.nextReport();
      expect(report_data.content).to.contain('1');
      // nothing to be returned
      var report_data = reportQueue.nextReport();
      expect(report_data).to.be.undefined;
      done();
    });

    it('should remove bots from the queue', function(done) {
      expect(reportQueue._bots).to.have.length(3);
      reportQueue.dequeue(one);
      reportQueue.dequeue(two);
      expect(reportQueue._bots).to.have.length(1);
      var bot = reportQueue.nextBot();
      expect(bot.contentService.keywords).to.equal('3');
      done();
    });
  });

  describe('bot management', function() {
    before(function(done) {
      botMaster.kill();
      reportQueue.clear();
      Source.create({type: 'dummy', keywords: 'one'});
      Source.create({type: 'dummy', keywords: 'two'});
      Source.create({type: 'dummy', keywords: 'three'});
      process.nextTick(function() {
        botMaster.start();
        done();
      });
    });

    // Stream data for 100ms
    before(function(done) {
      setTimeout(function() {
        done();
      }, 100);
    });

    it('should have added bots to the queue', function(done) {
      reportQueue.on('notEmpty', function() {
        process.nextTick(function() {
          expect(reportQueue._bots).to.have.length(3);
        });
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

    after(function(done) {
      botMaster.stop();
      done();
    });
  });

});
