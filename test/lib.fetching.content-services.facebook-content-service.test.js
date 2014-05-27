var expect = require('chai').expect;
var should = require('chai').should();
var FacebookContentService = require('../lib/fetching/content-services/facebook-content-service');
var ContentService = require('../lib/fetching/content-service');

describe('Facebook content service', function() {
  before(function(done) {
    var oneYearAgo = Math.round((Date.now() - 31536000) / 1000);
    facebookContentService = new FacebookContentService({fbPage: '251841205227', lastFetchedAt: oneYearAgo});
    done();
  });

  it('should instantiate correct facebook content service', function() {
    expect(facebookContentService).to.be.instanceOf(ContentService);
    expect(facebookContentService).to.be.instanceOf(FacebookContentService);
  });

  it('should fetch content from Facebook', function(done) {
    facebookContentService.fetch();
    facebookContentService.once('report', function(report_data) {
      expect(report_data).to.have.property('fetchedAt');
      expect(report_data).to.have.property('authoredAt');
      expect(report_data).to.have.property('author');
      expect(report_data.author).to.equal('251841205227');
      expect(report_data).to.have.property('url');
      done();
    });
    facebookContentService.on('error', function(err) {
      facebookContentService.removeAllListeners('report');
      done(err);
    });
  });
});

