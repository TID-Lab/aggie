var utils = require('./init');
var expect = require('chai').expect;
var PullBot = require('../../lib/fetching/bots/pull-bot');
var Bot = require('../../lib/fetching/bot');
var contentServiceFactory = require('../../lib/fetching/content-service-factory');
var Source = require('../../models/source');

describe('Pull bot', function() {
  before(function(done) {
    var source = new Source({ nickname: 'dummy-pull', media: 'dummy-pull' });
    source.save();
    var contentService = contentServiceFactory.create(source);
    pullBot = new PullBot({ source: source, contentService: contentService, interval: 100 });
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

  after(utils.wipeModels([Source]));
  after(utils.expectModelsEmpty);
});
