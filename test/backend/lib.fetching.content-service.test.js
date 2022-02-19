var utils = require('./init');
var expect = require('chai').expect;
var contentServiceFactory = require('../../backend/fetching/content-service-factory');
var ContentService = require('../../backend/fetching/content-service');
var DummyContentService = require('../../backend/fetching/content-services/dummy-content-service');
var Source = require('../../backend/models/source');

describe('Content service', function() {
  before(function(done) {
    var source = new Source({ nickname: 't', media: 'dummy', keywords: 't' });
    contentService = contentServiceFactory.create(source);
    done();
  });

  it('should instantiate correct content service', function() {
    expect(contentService).to.be.instanceOf(ContentService);
    expect(contentService).to.be.instanceOf(DummyContentService);
  });

  it('should fetch content from a specific service', function(done) {
    contentService.start();
    contentService.once('report', function(reportData) {
      expect(reportData).to.have.property('content');
      contentService.stop();
      done();
    });
  });

  after(utils.expectModelsEmpty);
});
