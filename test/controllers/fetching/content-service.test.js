var expect = require('chai').expect;
var contentServiceFactory = require(root_path + '/controllers/fetching/content-service-factory');
var ContentService = require(root_path + '/controllers/fetching/content-service');
var DummyContentService = require(root_path + '/controllers/fetching/content-services/dummy-content-service');

describe('Content service', function() {
  before(function(done) {
    contentService = contentServiceFactory.create({source: 'dummy', filter: 't'});
    done();
  });

  it('should instantiate correct content service', function() {
    expect(contentService).to.be.instanceOf(ContentService);
    expect(contentService).to.be.instanceOf(DummyContentService);
  });

  it('should fetch content from a specific service', function(done) {
    contentService.start();
    contentService.on('reports', function(reports_data) {
      expect(reports_data).to.be.an.instanceof(Array);
      expect(reports_data).to.have.length(1);
      expect(reports_data[0]).to.have.property('content');
      expect(reports_data[0].content.toLowerCase()).to.contain('t');
      // Stop stream to ensure a single fetch
      contentService.stop();
      done();
    });
  });

});
