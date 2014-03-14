var expect = require('chai').expect;
var PushBot = require('../controllers/fetching/bots/push-bot');
var Bot = require('../controllers/fetching/bot').Bot;
var ContentService = require('../controllers/fetching/content-service');
var Report = require('../models/report');

describe('Push bot', function() {
  before(function(done) {
    var contentService = ContentService({source: 'dummy', filter: 't'});
    pushBot = new PushBot(contentService);
    done();
  });

  it('should instantiate a push-type content service', function() {
    expect(pushBot.type).to.equal('push');
    expect(pushBot).to.be.instanceOf(Bot);
  });

  it('should tell content service to start streaming reports', function(done) {
    pushBot.start();
    pushBot.on('report', function(report) {
      expect(report).to.be.instanceOf(Report);
      expect(report).to.have.property('content');
      expect(report.content).to.contain('t');
      // Stop stream to ensure a single fetch
      pushBot.stop();
      done();
    });
  });

});
