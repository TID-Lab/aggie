var expect = require('chai').expect;
var ContentService = require('../controllers/fetching/content-service');
var DummyContentService = require('../controllers/fetching/content-services/dummy-content-service');

describe('Content service', function() {
  before(function(done) {
    contentService = new ContentService({type: 'dummy', filter: 't'});
    done();
  });

  it('should instantiate correct content service', function() {
    expect(contentService).to.be.instanceOf(ContentService);
    expect(contentService).to.be.instanceOf(DummyContentService);
  });

  it('should fetch content from a specific service', function(done) {
    contentService.start();
    contentService.on('data', function(data) {
      expect(data).to.have.property('text');
      expect(data.text.toLowerCase()).to.contain('t');
      // Stop stream to ensure a single fetch
      contentService.stop();
      done();
    });
  });

});
