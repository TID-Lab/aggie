var expect = require('chai').expect;
var botFactory = require(root_path + '/controllers/fetching/bot-factory');
var ContentService = require(root_path + '/controllers/fetching/content-service');

describe('Bot', function() {
  before(function(done) {
    bot = botFactory.create({sourceType: 'dummy', keywords: 't', interval: 500});
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
    bot.on('reports', function() {
      var data = bot.fetchNext();
      expect(data).to.have.property('content');
      expect(data.content.toLowerCase()).to.contain('t');
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

});
