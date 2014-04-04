require('./init');
var expect = require('chai').expect;
var PushBot = require('../controllers/fetching/bots/push-bot');
var Bot = require('../controllers/fetching/bot');
var contentServiceFactory = require('../controllers/fetching/content-service-factory');

describe('Push bot', function() {
  before(function(done) {
    var contentService = contentServiceFactory.create({sourceType: 'dummy', keywords: 't'});
    pushBot = new PushBot(contentService);
    done();
  });

  it('should instantiate a push-type content service', function() {
    expect(pushBot.type).to.equal('push');
    expect(pushBot).to.be.instanceOf(Bot);
  });

  it('should tell content service to start streaming reports', function(done) {
    pushBot.start();
    pushBot.on('reports', function(reports_data) {
      expect(reports_data).to.be.an.instanceof(Array);
      expect(reports_data).to.have.length(1);
      expect(reports_data[0]).to.have.property('content');
      expect(reports_data[0].content).to.contain('t');
      // Stop stream to ensure a single fetch
      pushBot.stop();
      done();
    });
  });

});
