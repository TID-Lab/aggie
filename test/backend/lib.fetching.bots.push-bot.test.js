var utils = require('./init');
var expect = require('chai').expect;
var PushBot = require('../../lib/fetching/bots/push-bot');
var Bot = require('../../lib/fetching/bot');
var contentServiceFactory = require('../../lib/fetching/content-service-factory');
var Source = require('../../models/source');

describe('Push bot', function() {
  before(function(done) {
    var source = new Source({ nickname: 't', media: 'dummy', keywords: 't' });
    var contentService = contentServiceFactory.create(source);
    pushBot = new PushBot({ source: source, contentService: contentService });
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

  after(utils.expectModelsEmpty);
});
