var expect = require('chai').expect;
var TwitterContentService = require(root_path + '/controllers/fetching/content-services/twitter-content-service');

describe('Twitter content service', function() {
  before(function(done) {
    twitterContentService = new TwitterContentService('t');
    done();
  });

  it('should fetch content from Twitter', function(done) {
    twitterContentService.start();
    twitterContentService.on('reports', function(reports_data) {
      expect(reports_data).to.be.an.instanceof(Array);
      expect(reports_data).to.have.length(1);
      expect(reports_data[0]).to.have.property('content');
      expect(reports_data[0].content.toLowerCase()).to.contain('t');
      // Stop stream to ensure a single fetch
      twitterContentService.stop();
      done();
    });
  });

});
