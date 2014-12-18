require('./init');
var util = require('util');
var expect = require('chai').expect;
var ELMOContentService = require('../lib/fetching/content-services/elmo-content-service');
var ContentService = require('../lib/fetching/content-service');

function loadElmoServiceWithFixture(service, fixture) {
  var elmoContentService = service;
  if (!elmoContentService) {
    var FixtureBasedElmoContentService = function(options) {
      ELMOContentService.call(this, options);
    };
    
    util.inherits(FixtureBasedElmoContentService, ELMOContentService);
    elmoContentService = new FixtureBasedElmoContentService({url: 'http://dummy_url'});
  
    FixtureBasedElmoContentService.prototype._loadData = function(options, cb) {
      var self = this;
      var data = require(options.fixture);
      process.nextTick(function() {
        if (data.length) self._handleResults(data);
        return cb(null, self._lastReportDate);
      });
    };
  }
  
  var options = {fixture: fixture};
  elmoContentService.fetch(options);
  
  return elmoContentService;
}

describe('ELMO content service', function() {
  
  it('should instantiate correct ELMO content service', function() {
    var elmoContentService = new ELMOContentService({});
    expect(elmoContentService).to.be.instanceOf(ContentService);
    expect(elmoContentService).to.be.instanceOf(ELMOContentService);
  });
  
  it('should fetch empty content', function(done) {
    var elmoContentService = loadElmoServiceWithFixture(null, './fixtures/elmo-0.json');
    expectToNotEmitReport(elmoContentService, done);
    expect(elmoContentService._lastReportDate).to.be.null;
    elmoContentService.once('error', function(err) {
      done(err);
    });
    
    setTimeout(done, 500);
  });
  
  it('should fetch mock content from ELMO', function(done) {
    var elmoContentService = loadElmoServiceWithFixture(null, './fixtures/elmo-1.json');
    var remaining = 2;
    elmoContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('fetchedAt');
      expect(report_data).to.have.property('authoredAt');
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('author');
      switch (remaining) {
        case 2:
          expect(report_data.content).to.contain('[FOO: Certainly] [BAR: Nope] [BAZ: Perhaps]');
          expect(report_data.author).to.equal(1);
          break;
        case 1:
          expect(report_data.content).to.contain('[FOO2: Yes] [BAR2: No] [BAZ2: Maybe]');
          expect(report_data.author).to.equal(2);
          break;
      }
      if (--remaining === 0) {
        // Wait so that we can catch unexpected reports
        setTimeout(done, 100);
        expect(elmoContentService._lastReportDate).to.equal(Date.parse('2014-06-17T15:00:00Z'));
      } else if (remaining < 0) {
        return done(new Error('Unexpected report'));
      }
    });
    elmoContentService.once('error', function(err) {
      done(err);
    });
  });
  
  it('should query for new data without duplicates', function(done) {
    
    function onFixture1ReportCallback(cb) {
      var remaining = 2;
      return function(report_data) {
        switch (remaining--) {
          case 2:
            expect(report_data.content).to.contain('[FOO: Certainly] [BAR: Nope] [BAZ: Perhaps]');
            expect(report_data.author).to.equal(1);
            break;
          case 1:
            expect(report_data.content).to.contain('[FOO2: Yes] [BAR2: No] [BAZ2: Maybe]');
            expect(report_data.author).to.equal(2);
            
            setTimeout(function() {
              expect(elmoContentService._lastReportDate).to.equal(Date.parse('2014-06-17T15:00:00Z'));
              cb();
            }, 100);
            break;
        }
      };
    }
    
    function onFixture2ReportCallback(cb) {
      return function(report_data) {
        expect(report_data.content).to.contain('[FOO3: Affirmative] [BAR3: Negative] [BAZ3: Doubtful]');
        expect(report_data.author).to.equal(3);
        cb();
      };
    }
    
    var elmoContentService = loadElmoServiceWithFixture(null, './fixtures/elmo-1.json');
    elmoContentService.once('error', function(err) {
      done(err);
    });
    
    elmoContentService.on('report', onFixture1ReportCallback(function(err){
      if (err) return done(err);
      
      elmoContentService.removeAllListeners('report');
      process.nextTick(function() {
        elmoContentService.once('report', onFixture2ReportCallback(function(err){
          return done(err);
        }));
        loadElmoServiceWithFixture(elmoContentService, './fixtures/elmo-2.json');
      });
    }));
  });
  
  describe('Errors', function() {
    
    it('should emit a missing URL error', function(done) {
      var elmoContentService = new ELMOContentService({});
      elmoContentService.fetch();
      expectToNotEmitReport(elmoContentService, done);
      expectToEmitError(elmoContentService, 'Missing ELMO URL', done);
    });

    it('should emit an unauthorized token error', function(done) {
      elmoContentService = new ELMOContentService({
        url: 'https://example.com',
        authToken: '123'
      });

      // Stub the content service to return 403
      elmoContentService._httpRequest = function(params, callback) {
        process.nextTick(function() { callback({message: 'Unauthorized'}); });
      };

      elmoContentService.fetch();
      expectToNotEmitReport(elmoContentService, done);
      expectToEmitError(elmoContentService, 'Unauthorized', done);
    });
  });
});
