var utils = require('./init');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var CrowdTangleContentService = require('../../lib/fetching/content-services/crowd-tangle-content-service');
var ContentService = require('../../lib/fetching/content-service');
var contentServiceFactory = require('../../lib/fetching/content-service-factory');


// Stubs the _httpRequest method of the content service to return the data in the given fixture file.
function stubWithFixture(fixtureFile, service) {

  // If service is null, creates a CrowdTangleContentService
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

  it('should return data from CrowdTangle', function(done) {
    var service = stubWithFixture('ct-3.json');

    service.once('error', function(err) { done(err); });

    service.on('report', function(reportData) {
      expect(reportData.metadata.crowdtangleId).to.not.be.undefined;
    });
    setTimeout(done, 500);
  });


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
        expect(reportData.content).to.contain('Happy Birthday');
        expect(reportData.author).to.equal('Philadelphia Phillies');
        expect(reportData.url).to.contain('https');
        expect(reportData.metadata.type).to.equal('photo');
        break;
      case 2:
        expect(reportData.content).to.contain('innovative ways to sit around');
        expect(reportData.author).to.equal('Taylor Swift');
        expect(reportData.metadata.platform).to.equal('Facebook');
        expect(reportData.metadata.type).to.equal('native_video');
        break;
      case 3:
        return done(new Error('Unexpected report'));
      }
    });

    // Give enough time for extra report to appear.
    process.nextTick(function() { if (fetched == 2) done(); });

    service.fetch({ maxCount: 50 }, function() {});
  });

  describe('Errors', function() {

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
