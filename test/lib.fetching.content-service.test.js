require('./init');
var expect = require('chai').expect;
var contentServiceFactory = require('../lib/fetching/content-service-factory');
var ContentService = require('../lib/fetching/content-service');
var DummyContentService = require('../lib/fetching/content-services/dummy-content-service');
var Source = require('../models/source');

describe('Content service', function() {
  before(function(done) {
<<<<<<< HEAD
    var source = new Source({type: 'dummy', keywords: 't'});
    contentService = contentServiceFactory.create({source: source});
=======
    contentService = contentServiceFactory.create({sourceType: 'dummy', keywords: 't'});
>>>>>>> 1b4ff97ac9ff8969305a965a2f619ad2b875ad5b

    done();
  });

  it('should instantiate correct content service', function() {
    expect(contentService).to.be.instanceOf(ContentService);
    expect(contentService).to.be.instanceOf(DummyContentService);
   
  });

  it('should instantiate correct facebook content service', function() {
    expect(fbContentService).to.be.instanceOf(ContentService);
    expect(fbContentService).to.be.instanceOf(FacebookDummyContentService);
   
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
