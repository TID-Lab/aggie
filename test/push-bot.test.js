var expect = require('chai').expect;
var PushBot = require('../controllers/fetching/bots/push-bot');
var Bot = require('../controllers/fetching/bot');
var ContentService = require('../controllers/fetching/content-service');
var Report = require('../models/report');

describe('Push bot', function() {
  before(function(done) {
    pushBot = new PushBot({type: 'dummy', filter: 't'});
    done();
  });

  it('should instantiate a push-type content service', function() {
    expect(pushBot).to.have.property('contentService');
    expect(pushBot.contentService).to.be.instanceOf(ContentService);
    expect(pushBot.contentService.type).to.equal('push');
  });

  it('should tell content service to start streaming reports', function(done) {
    pushBot.start();
    pushBot.on('data', function(data) {
      expect(data).to.be.instanceOf(Report);
      expect(data).to.have.property('content');
      expect(data.content).to.contain('t');
      // Stop stream to ensure a single fetch
      pushBot.stop();
      done();
    });
  });

});
