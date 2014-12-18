require('./init');
var util = require('util');
var expect = require('chai').expect;
var FacebookContentService = require('../lib/fetching/content-services/facebook-content-service');
var ContentService = require('../lib/fetching/content-service');

function loadFbServiceWithFixture(service, fixture) {
  var facebookContentService = service;
  if (!facebookContentService) {
    var FixtureBasedFacebookContentService = function(options) {
      FacebookContentService.call(this, options);
    };
    
    util.inherits(FixtureBasedFacebookContentService, FacebookContentService);
  
    FixtureBasedFacebookContentService.prototype._loadData = function(options, cb) {
      var self = this;
      var data = require(options.fixture);
      process.nextTick(function() {
        self._handleResults(data.posts, data.authors);
        return cb(null, self._lastReportDate * 1000);
      });
    };
    
    facebookContentService = new FixtureBasedFacebookContentService({url: 'http://dummy_url'});
  }
  
  var options = {fixture: fixture};
  facebookContentService.fetch(options);
  
  return facebookContentService;
}

function loadFbServiceWithUrl(url) {
  var facebookContentService = new FacebookContentService({url: url});
  facebookContentService.fetch();
  return facebookContentService;
}

describe('Facebook content service', function() {
  
  it('should instantiate correct facebook content service', function() {
    var facebookContentService = new FacebookContentService({});
    expect(facebookContentService).to.be.instanceOf(ContentService);
    expect(facebookContentService).to.be.instanceOf(FacebookContentService);
  });
  
  it('should fetch empty content', function(done) {
    var facebookContentService = loadFbServiceWithFixture(null, './fixtures/facebook-0.json');
    expectToNotEmitReport(facebookContentService, done);
    facebookContentService.once('error', function(err) {
      done(err);
    });
    setTimeout(function() {
      done();
    }, 100);
  });
  
  it('should fetch mock content from Facebook', function(done) {
    var facebookContentService = loadFbServiceWithFixture(null, './fixtures/facebook-1.json');
    var remaining = 3;
    facebookContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('fetchedAt');
      expect(report_data).to.have.property('authoredAt');
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('author');
      expect(report_data).to.have.property('url');
      switch (remaining) {
        case 3:
          expect(report_data.content).to.contain('The ACC Champion');
          expect(report_data.author).to.equal('Georgia Tech');
          expect(report_data.url).to.not.contain('comment');
          break;
        case 2:
          expect(report_data.content).to.contain('Bioengineers at');
          expect(report_data.author).to.equal('Georgia Tech');
          expect(report_data.url).to.not.contain('comment');
          break;
        case 1:
          expect(report_data.content).to.contain('Amazing');
          expect(report_data.author).to.equal('Test User 1');
          expect(report_data.url).to.contain('comment');
          break;
      }
      if (--remaining === 0) {
        // Wait so that we can catch unexpected reports
        setTimeout(function() {
          done();
        }, 100);
      } else if (remaining < 0) {
        return done(new Error('Unexpected report'));
      }
    });
    facebookContentService.once('error', function(err) {
      done(err);
    });
  });
  
  it('should query for new data without duplicates', function(done) {
    function onFixture1ReportCallback(cb) {
      var remaining = 3;
      return function(report_data) {
        switch (remaining--) {
          case 3:
            expect(report_data.content).to.contain('The ACC Champion');
            expect(report_data.author).to.equal('Georgia Tech');
            expect(report_data.url).to.not.contain('comment');
            break;
          case 2:
            expect(report_data.content).to.contain('Bioengineers at');
            expect(report_data.author).to.equal('Georgia Tech');
            expect(report_data.url).to.not.contain('comment');
            break;
          case 1:
            expect(report_data.content).to.contain('Amazing');
            expect(report_data.author).to.equal('Test User 1');
            expect(report_data.url).to.contain('comment');
            
            setTimeout(function() {
              cb();
            }, 100);
            break;
        }
      };
    }
    
    function onFixture2ReportCallback(cb) {
      var remaining = 3;
      return function(report_data) {
        switch (remaining--) {
          case 3:
            expect(report_data.content).to.contain('Go jackets');
            expect(report_data.author).to.equal('Test User 1');
            expect(report_data.url).to.contain('comment');
            break;
          case 2:
            expect(report_data.content).to.contain('we can do that');
            expect(report_data.author).to.equal('Test User 2');
            expect(report_data.url).to.contain('comment');
            break;
          case 1:
            expect(report_data.content).to.contain('GA Tech ranked');
            expect(report_data.author).to.equal('Test User 3');
            expect(report_data.url).to.not.contain('comment');
            
            setTimeout(function() {
              cb();
            }, 100);
            break;
        }
      };
    }
    
    var facebookContentService = loadFbServiceWithFixture(null, './fixtures/facebook-1.json');
    facebookContentService.once('error', function(err) {
      done(err);
    });
    
    facebookContentService.on('report', onFixture1ReportCallback(function(err){
      if (err) return done(err);
      
      facebookContentService.removeAllListeners('report');
      process.nextTick(function() {
        facebookContentService.on('report', onFixture2ReportCallback(function(err){
          return done(err);
        }));
        loadFbServiceWithFixture(facebookContentService, './fixtures/facebook-2.json');
      });
    }));
  });
  
  describe('Online', function() {
    
    it('should fetch real content from Facebook', function(done) {
      var facebookContentService = loadFbServiceWithUrl('http://www.facebook.com/georgiatech');
      facebookContentService.once('report', function(report_data) {
        expect(report_data).to.have.property('fetchedAt');
        expect(report_data).to.have.property('authoredAt');
        expect(report_data).to.have.property('content');
        expect(report_data).to.have.property('author');
        expect(report_data).to.have.property('url');
        done();
      });
      facebookContentService.once('error', function(err) {
        done(err);
      });
    });

    it('should re-fetch to get an empty content list', function(done) {
      var facebookContentService = loadFbServiceWithUrl('http://www.facebook.com/georgiatech');
      facebookContentService.once('report', function(report_data) {
        
        process.nextTick(function() {
          facebookContentService.fetch();
          expectToNotEmitReport(facebookContentService, done);
          facebookContentService.once('error', function(err) {
            done(err);
          });
          setTimeout(function() {
            done();
          }, 100);
        });
      });
    });
  });

  describe('Errors', function() {
    
    it('should emit a missing URL error', function(done) {
      var facebookContentService = new FacebookContentService({url: ''});
      facebookContentService.fetch();
      expectToNotEmitReport(facebookContentService, done);
      expectToEmitError(facebookContentService, 'Missing Facebook URL', done);
    });

    it('should emit an invalid URL error', function(done) {
      var facebookContentService = new FacebookContentService({url: 'georgiatech'});
      facebookContentService.fetch();
      expectToNotEmitReport(facebookContentService, done);
      expectToEmitError(facebookContentService, 'Invalid Facebook URL', done);
    });
  });
});
