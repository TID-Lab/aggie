var expect = require('chai').expect;
var PushBot = require('../controllers/fetching/bots/push-bot');
var Bot = require('../controllers/fetching/bot');
var csFactory = require('../controllers/fetching/content-service-factory');

describe('Push bot', function() {
  before(function(done) {
    var contentService = csFactory({source: 'dummy', filter: 't'});
    pushBot = new PushBot(contentService);
    done();
  });

  it('should instantiate a push-type content service', function() {
    expect(pushBot.type).to.equal('push');
    expect(pushBot).to.be.instanceOf(Bot);
  });

  it('should tell content service to start streaming reports', function(done) {
    pushBot.start();
    pushBot.on('report', function(report_data) {
      expect(report_data).to.have.property('content');
      expect(report_data.content).to.contain('t');
      // Stop stream to ensure a single fetch
      pushBot.stop();
      done();
    });
  });

});
