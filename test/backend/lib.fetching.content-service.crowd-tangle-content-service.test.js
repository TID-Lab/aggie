var utils = require('./init');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var CrowdTangleContentService = require('../../lib/fetching/content-services/crowd-tangle-content-service');
var ContentService = require('../../lib/fetching/content-service');
var contentServiceFactory = require('../../lib/fetching/content-service-factory');

// Stubs the _httpRequest method of the content service to return the data in the given fixture file.
// If service is null, creates an ElmoContentService
function stubWithFixture(fixtureFile, service) {
  // Create service if not provided.
  service = service || new CrowdTangleContentService({});

  // Make the stub function return the expected args (err, res, body).
  fixtureFile = path.join('test', 'backend', 'fixtures', fixtureFile);
  service._httpRequest = function(params, callback) {
    callback(null, { statusCode: 200 }, fs.readFileSync(fixtureFile).toString());
  };

  return service;
}

describe('CrowdTangle content service', function() {

  it('factory should instantiate correct CrowdTangle content service', function() {
    var service = new CrowdTangleContentService({});
    expect(service).to.be.instanceOf(ContentService);
    expect(service).to.be.instanceOf(CrowdTangleContentService);
  });

  it('should fetch empty content', function(done) {
    var service = stubWithFixture('ct-0.json');
    utils.expectToNotEmitReport(service, done);
    expect(service._lastReportDate).to.be.undefined;
    service.once('error', function(err) {
      done(err);
    });
    setTimeout(done, 500);
  });


  // TODO 1
  it('should fetch mock content from CrowdTangle', function(done) {
    var service = stubWithFixture('ct-1.json');
    var fetched = 0;

    service.once('error', function(err) { done(err); });

    service.on('report', function(reportData) {
      expect(reportData).to.have.property('fetchedAt');
      expect(reportData).to.have.property('authoredAt');
      expect(reportData).to.have.property('content');
      expect(reportData).to.have.property('author');
      expect(reportData).to.have.property('url');
      expect(reportData).to.have.property('metadata');
      switch (++fetched) {
      case 1:
        expect(reportData.content).to.contain('The ACC Champion');
        expect(reportData.author).to.equal('Georgia Tech');
        expect(reportData.url).to.contain('https');
        expect(reportData.metadata.likeCount).to.equal(41);
        expect(reportData.metadata.reactionCount).to.equal(42);
        expect(reportData.metadata.place).to.equal('Area 51');
        break;
      case 2:
        expect(reportData.content).to.contain('Bioengineers at');
        expect(reportData.author).to.equal('Georgia Tech');
        expect(reportData.metadata.likeCount).to.equal(43);
        expect(reportData.metadata.reactionCount).to.equal(44);
        expect(reportData.metadata.place).to.equal('Area 52');
        break;
      case 3:
        expect(reportData.content).to.contain('Amazing');
        expect(reportData.author).to.equal('Test User 1');
        expect(reportData.metadata.likeCount).to.equal(0);
        break;
      case 4:
        return done(new Error('Unexpected report'));
      }
    });

    // Give enough time for extra report to appear.
    setTimeout(function() { if (fetched == 3) done(); }, 100);

    service.fetch({ maxCount: 50 }, function() {});
  });

  describe('errors', function() {

    // test for bad data
    it('should emit json parse error', function(done) {
      var service = stubWithFixture('ct-2.json');
      utils.expectToNotEmitReport(service, done);
      utils.expectToEmitError(service, 'Parse error: Unexpected end of input', done);
      service.fetch({ maxCount: 50 }, function() {});
    });
  });

  after(utils.expectModelsEmpty);
});
