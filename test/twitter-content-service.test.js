var expect = require('chai').expect;
var TwitterContentService = require('../controllers/fetching/twitter-content-service');

describe('Twitter content service', function() {
  before(function(done) {
    twitterContentService = new TwitterContentService('t');
    done();
  });

  it('should fetch content from Twitter', function(done) {
    twitterContentService.start();
    twitterContentService.on('data', function(data) {
      expect(data).to.have.property('text');
      expect(data.text.toLowerCase()).to.contain('t');
      // Stop to ensure a single fetch
      twitterContentService.stop();
      done();
    });
  });

});
