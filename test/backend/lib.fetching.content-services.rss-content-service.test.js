var utils = require('./init');
var expect = require('chai').expect;
var RSSContentService = require('../../lib/fetching/content-services/rss-content-service');
var fs = require('fs');
var path = require('path');

// Stubs the _doRequest method of the content service to return the data in the given fixture file.
// If service is null, creates a dummy FacebookContentService
function stubWithFixture(fixtureFile, service) {
  // Create service if not provided.
  service = service || new RSSContentService({ url: 'http://example.com' });

  // Make the stub function return the expected args (err, data).
  fixtureFile = path.join('test', 'backend', 'fixtures', fixtureFile);
  service._doRequest = function(callback) {
    callback(null, { statusCode: 200 }, fs.createReadStream(fixtureFile));
  };

  return service;
}

describe('RSS content service', function() {

  it('should fetch empty content', function(done) {
    var service = stubWithFixture('rss-empty.json');
    utils.expectToNotEmitReport(service, done);
    service.once('error', function(err) { done(err); });
    setTimeout(done, 100);
  });

  it('should fetch mock content from RSS', function(done) {
    var service = stubWithFixture('rss-good-1.xml');
    var fetched = 0;

    service.once('error', function(err) { done(err); });

    service.on('report', function(reportData) {
      expect(reportData).to.have.property('fetchedAt');
      expect(reportData).to.have.property('authoredAt');
      expect(reportData).to.have.property('content');
      expect(reportData).to.have.property('author');
      expect(reportData).to.have.property('url');
      switch (++fetched) {
      case 1:
        expect(reportData.content).to.contain('River'); // Title should be concatted to content
        expect(reportData.content).to.contain('Stormwater');
        expect(reportData.author).to.equal('Jupiter');
        expect(reportData.url).to.contain('river');
        break;
      case 2:
        expect(reportData.content).to.contain('Elected');
        expect(reportData.content).to.contain('CoC professor');
        expect(reportData.author).to.equal('Jupiter');
        expect(reportData.url).to.contain('lipton');
        break;
      case 3:
        return done(new Error('Unexpected report'));
      }
    });

    // Give enough time for extra report to appear.
    setTimeout(function() { if (fetched == 2) done(); }, 100);

    service.fetch({ maxCount: 50 }, function() {});
  });

  it('should avoid duplicates', function(done) {
    // Fetch first time.
    var service = stubWithFixture('rss-good-1.xml');
    service.fetch({ maxCount: 50 }, function() {

      // Stub for second fetch, which has one overlapping item.
      stubWithFixture('rss-good-2.xml', service);
      var fetched = 0;

      service.once('error', function(err) { done(err); });

      service.on('report', function(reportData) {
        switch (++fetched) {
        case 1:
          expect(reportData.content).to.contain('fracture toughness');
          break;
        case 2:
          expect(reportData.content).to.contain('earn funding');
          break;
        case 3:
          return done(new Error('Unexpected report'));
        }
      });

      // Give enough time for extra report to appear.
      setTimeout(function() { if (fetched == 2) done(); }, 100);

      // Run second fetch.
      service.fetch({ maxCount: 50 }, function() {});
    });
  });

  it('should emit warnings for missing data', function(done) {
    var service = stubWithFixture('rss-bad.xml');

    service.on('report', function() {
      done(new Error('No report data should be emitted'));
    });

    service.on('error', function() {
      done(new Error('No errors should be emitted'));
    });

    // Expect to get a warning.
    service.on('warning', function(err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.contain('Parse warning');
      done();
    });

    service.fetch({ maxCount: 50 }, function() {});
  });

  it('should emit errors for malformed data', function(done) {
    var service = stubWithFixture('rss-ugly.xml');

    service.on('report', function() {
      done(new Error('No report data should be emitted'));
    });

    service.on('warning', function() {
      done(new Error('No warnings should be emitted'));
    });

    service.on('error', function(err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.contain('Not a feed');
      done();
    });

    service.fetch({ maxCount: 50 }, function() {});
  });

  after(utils.expectModelsEmpty);
});
