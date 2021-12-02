var utils = require('./init');
var expect = require('chai').expect;
var botFactory = require('../../lib/fetching/bot-factory');
var ContentService = require('../../lib/fetching/content-service');
var Report = require('../../models/report');

describe('Bot', function() {
  before(function(done) {
    bot = botFactory.create({ media: 'dummy', keywords: 't', interval: 500 });
    done();
  });

  it('should instantiate a content service', function() {
    expect(bot).to.have.property('contentService');
    expect(bot.contentService).to.be.instanceOf(ContentService);
  });

  it('should tell content service to start streaming reports', function(done) {
    bot.start();
    expect(bot).to.have.property('enabled');
    expect(bot.enabled).to.be.true;
    done();
  });

  it('should fetch report data', function(done) {
    var reports = [];
    var remaining = 4;
    bot.on('report', function() {
      var data = bot.fetchNext();
      expect(data).to.have.property('content');
      reports.push(data);
      if (--remaining === 0) {
        expect(reports).to.have.length(4);
        done();
      }
    });
  });

  it('should tell content service to stop streaming reports', function(done) {
    bot.stop();
    expect(bot).to.have.property('enabled');
    expect(bot.enabled).to.be.false;
    done();
  });

  it('should clear its own queue', function(done) {
    bot.on('empty', function() {
      expect(bot.queue.count).to.equal(0);
      expect(bot.isEmpty()).to.be.true;
      done();
    });
    bot.clearQueue();
  });

  after(utils.expectModelsEmpty);
});
