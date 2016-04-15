require('./init');
var util = require('util');
var fs = require('fs');
var expect = require('chai').expect;
var FacebookContentService = require('../lib/fetching/content-services/facebook-content-service');
var ContentService = require('../lib/fetching/content-service');

// Stubs the _doRequest method of the content service to return the data in the given fixture file.
// If service is null, creates a dummy FacebookContentService
function stubWithFixture(fixtureFile, service) {
  // Create service if not provided.
  service = service || new FacebookContentService({url: 'http://example.com'});

  // Make the stub function return the expected args (err, data).
  fixtureFile = './fixtures/' + fixtureFile;
  service._doRequest = function(queries, callback) { callback(null, require(fixtureFile)); };

  return service;
}

describe('Facebook content service', function() {

  it('should instantiate correct facebook content service', function() {
    var service = new FacebookContentService({});
    expect(service).to.be.instanceOf(ContentService);
    expect(service).to.be.instanceOf(FacebookContentService);
  });

  it('should fetch empty content', function(done) {
    var service = stubWithFixture('facebook-0.json');
    expectToNotEmitReport(service, done);
    service.once('error', function(err) { done(err); });
    setTimeout(done, 100);
  });

  it('should grab the correct source given multiple url types', function() {
    var service = new FacebookContentService({url: "http://test.com/"});
    expect(service._getSourceFromUrl('http://facebook.com/cocacola')).to.equal('cocacola');
    expect(service._getSourceFromUrl('https://www.facebook.com/CocaColaUnitedStates/?brand_redir=40796308305&test=2'))
        .to.equal('CocaColaUnitedStates');
    expect(service._getSourceFromUrl('https://www.facebook.com/Gatorade/')).to.equal('Gatorade');
    expect(service._getSourceFromUrl('https://www.facebook.com/groups/Gatorade/')).to.equal('Gatorade');
  });

  it('should fetch mock content from Facebook', function(done) {
    var service = stubWithFixture('facebook-1.json');
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
          expect(reportData.content).to.contain('The ACC Champion');
          expect(reportData.author).to.equal('Georgia Tech');
          expect(reportData.url).to.contain('https');
          break;
        case 2:
          expect(reportData.content).to.contain('Bioengineers at');
          expect(reportData.author).to.equal('Georgia Tech');
          break;
        case 3:
          expect(reportData.content).to.contain('Amazing');
          expect(reportData.author).to.equal('Test User 1');
          break;
        case 4:
          return done(new Error('Unexpected report'));
      }
    });

    // Give enough time for extra report to appear.
    setTimeout(function() { if (fetched == 3) done(); }, 100);

    service.fetch({maxCount: 50}, function(){});
  });

  it('should get new comments from old posts, excluding already added posts', function(done) {

    var service = stubWithFixture('facebook-1.json');
    service.fetch({maxCount: 50}, function(){});

    stubWithFixture('facebook-2.json', service);
    service.once('error', function(err) { done(err); });

    var fetched = 0;
    service.on('report', function(reportData) {
      switch (++fetched) {
        case 1:
          expect(reportData.content).to.contain('Totez cool');
          expect(reportData.author).to.equal('Test User 2');
          expect(reportData.url).to.contain('https');
          break;
        case 2:
          expect(reportData.content).to.contain('Best');
          expect(reportData.author).to.equal('Test User 3');
          expect(reportData.url).to.contain('https');
          break;
        case 3:
          expect(reportData.content).to.contain('ranked');
          expect(reportData.author).to.equal('Test User 4');
          expect(reportData.url).to.contain('https');
          break;
        case 4:
          return done(new Error('Unexpected report'));
      }
    });

    // Give enough time for extra report to appear.
    setTimeout(function() { if (fetched == 3) done(); }, 100);

    service.fetch({maxCount: 50}, function(){});
  });

  describe('Errors', function() {

    it('should emit a missing URL error', function(done) {
      var service = new FacebookContentService({url: ''});
      expectToNotEmitReport(service, done);
      expectToEmitError(service, 'Missing Facebook URL', done);
      service.fetch({maxCount: 50}, function(){});
    });
  });
});
