var expect = require('chai').expect;
var TwitterContentService = require('../controllers/fetching/content-services/twitter-content-service');

describe('Twitter content service', function() {
  before(function(done) {
    twitterContentService = new TwitterContentService('t');
    done();
  });

  it('should fetch content from Twitter', function(done) {
    twitterContentService.start();
    twitterContentService.on('report', function(report) {
      expect(report).to.have.property('content');
      expect(report.content.toLowerCase()).to.contain('t');
      // Stop stream to ensure a single fetch
      twitterContentService.stop();
      done();
    });
  });

});
