var expect = require('chai').expect;
var csFactory = require('../controllers/fetching/content-service-factory');
var ContentService = require('../controllers/fetching/content-service');
var DummyContentService = require('../controllers/fetching/content-services/dummy-content-service');

describe('Content service', function() {
  before(function(done) {
    contentService = csFactory({source: 'dummy', filter: 't'});
    done();
  });

  it('should instantiate correct content service', function() {
    expect(contentService).to.be.instanceOf(ContentService);
    expect(contentService).to.be.instanceOf(DummyContentService);
  });

  it('should fetch content from a specific service', function(done) {
    contentService.start();
    contentService.on('report', function(report_data) {
      expect(report_data).to.have.property('content');
      expect(report_data.content.toLowerCase()).to.contain('t');
      // Stop stream to ensure a single fetch
      contentService.stop();
      done();
    });
  });

});
