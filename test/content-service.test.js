var expect = require('chai').expect;
var ContentService = require('../controllers/fetching/content-service');
var DummyContentService = require('../controllers/fetching/content-services/dummy-content-service');

describe('Content service', function() {
  before(function(done) {
    contentService = ContentService({source: 'dummy', filter: 't'});
    done();
  });

  it('should instantiate correct content service', function() {
    expect(contentService).to.be.instanceOf(ContentService.ContentService);
    expect(contentService).to.be.instanceOf(DummyContentService);
  });

  it('should fetch content from a specific service', function(done) {
    contentService.start();
    contentService.on('report', function(report) {
      expect(report).to.have.property('content');
      expect(report.content.toLowerCase()).to.contain('t');
      // Stop stream to ensure a single fetch
      contentService.stop();
      done();
    });
  });

});
