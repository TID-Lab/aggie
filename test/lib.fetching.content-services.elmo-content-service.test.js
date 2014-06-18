require('./init');
var expect = require('chai').expect;
var ELMOContentService = require('../lib/fetching/content-services/elmo-content-service');
var ContentService = require('../lib/fetching/content-service');

var elmoContentService, _fetch;
describe('ELMO content service', function() {
  before(function(done) {
    // Override fetch so that we can test local files
    _fetch = ELMOContentService.prototype.fetch;
    ELMOContentService.prototype.fetch = function(fixture, callback) {
      var self = this;
      var data = require(fixture);
      process.nextTick(function() {
        if (data.length) self._handleResults(data);
        callback && callback(null, self.lastReportDate);
      });
    };
    elmoContentService = new ELMOContentService({});
    done();
  });

  it('should instantiate correct ELMO content service', function() {
    expect(elmoContentService).to.be.instanceOf(ContentService);
    expect(elmoContentService).to.be.instanceOf(ELMOContentService);
  });

  it('should fetch empty content', function(done) {
    elmoContentService.fetch('./fixtures/elmo-0.json', function(err, lastReportDate) {
      expect(err).to.be.null;
      expect(lastReportDate).to.be.null;
    });
    expectToNotEmitReport(elmoContentService, done);
    elmoContentService.once('error', done);
    setTimeout(done, 500);
  });

  it('should fetch mock content from ELMO', function(done) {
    elmoContentService.fetch('./fixtures/elmo-1.json', function(err, lastReportDate) {
      expect(err).to.be.null;
      expect(lastReportDate).to.equal(Date.parse('2014-06-17T15:00:00Z'));
    });
    var remaining = 2;
    elmoContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('fetchedAt');
      expect(report_data).to.have.property('authoredAt');
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('author');
      switch (remaining) {
        case 2:
          expect(report_data.content).to.contain('[CodeFOO: Certainly] [CodeBAR: Nope] [CodeBAZ: Perhaps]');
          expect(report_data.author).to.equal(1);
          break;
        case 1:
          expect(report_data.content).to.contain('[CodeFOO2: Yes] [CodeBAR2: No] [CodeBAZ2: Maybe]');
          expect(report_data.author).to.equal(2);
          break;
      }
      if (--remaining === 0) {
        // Wait so that we can catch unexpected reports
        setTimeout(done, 100);
      } else if (remaining < 0) {
        return done(new Error('Unexpected report'));
      }
    });
    elmoContentService.once('error', done);
  });

  it('should query for new data without duplicates', function(done) {
    elmoContentService.fetch('./fixtures/elmo-2.json', function(err, lastReportDate) {
      expect(err).to.be.null;
      expect(lastReportDate).to.equal(Date.parse('2014-06-17T20:00:00Z'));
    });
    var remaining = 1;
    elmoContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('fetchedAt');
      expect(report_data).to.have.property('authoredAt');
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('author');
      switch (remaining) {
        case 1:
          expect(report_data.content).to.contain('[CodeFOO3: Affirmative] [CodeBAR3: Negative] [CodeBAZ3: Doubtful]');
          expect(report_data.author).to.equal(3);
          break;
      }
      if (--remaining === 0) {
        // Wait so that we can catch duplicate reports
        setTimeout(done, 100);
      } else if (remaining < 0) {
        return done(new Error('Duplicate report'));
      }
    });
    elmoContentService.once('error', done);
  });

  describe('Online', function() {
    before(function() {
      // Restore original `fetch()`
      ELMOContentService.prototype.fetch = _fetch;
      elmoContentService = new ELMOContentService({url: 'https://secure1.sassafras.coop/api/v1/responses.json?form_id=19'});
    });

    it('should fetch real content from ELMO', function(done) {
      elmoContentService.fetch();
      elmoContentService.once('report', function(report_data) {
        expect(report_data).to.have.keys(['authoredAt', 'fetchedAt', 'content', 'author']);
        expect(report_data.content).to.contain('[Code');
        done();
      });
      elmoContentService.on('error', done);
    });

    it('should re-fetch to get an empty content list', function(done) {
      elmoContentService.fetch();
      expectToNotEmitReport(elmoContentService, done);
      elmoContentService.once('error', done);
      setTimeout(done, 500);
    });
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
        url: 'https://secure1.sassafras.coop/api/v1/responses.json?form_id=19',
        authToken: '123'
      });
      elmoContentService.fetch();
      expectToNotEmitReport(elmoContentService, done);
      expectToEmitError(elmoContentService, 'Unauthorized', done);
    });
  });

  afterEach(function() {
    elmoContentService.removeAllListeners();
  });
});
