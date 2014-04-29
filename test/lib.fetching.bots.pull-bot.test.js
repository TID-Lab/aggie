require('./init');
var expect = require('chai').expect;
var PullBot = require('../lib/fetching/bots/pull-bot');
var Bot = require('../lib/fetching/bot');
var contentServiceFactory = require('../lib/fetching/content-service-factory');

describe('Pull bot', function() {
  before(function(done) {
    var contentService = contentServiceFactory.create({sourceType: 'dummy-pull'});
    pullBot = new PullBot({contentService: contentService});
    done();
  });

  it('should instantiate a pull-type content service', function() {
    expect(pullBot.type).to.equal('pull');
    expect(pullBot).to.be.instanceOf(Bot);
  });

  it('should tell content service to start streaming reports', function(done) {
    var tries = 3;
    pullBot.on('report', function(report_data) {
      expect(report_data).to.have.property('content');
      if (--tries === 0) {
        pullBot.stop();
        done();
      }
    });
    pullBot.start();
  });

});
