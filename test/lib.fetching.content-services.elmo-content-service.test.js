require('./init');
var expect = require('chai').expect;
var ELMOContentService = require('../lib/fetching/content-services/elmo-content-service');
var ContentService = require('../lib/fetching/content-service');
var _ = require('underscore');

var elmoContentService, _fetchPage;
describe('ELMO content service', function() {
  before(function(done) {
    // Override fetch so that we can test local files
    _fetchPage = ELMOContentService.prototype._fetchPage;
    ELMOContentService.prototype._fetchPage = function(fixture, callback) {
      callback = callback || function() {};
      // Convert fake URL to path
      fixture = fixture.replace(/http:\/\//ig, './fixtures/');
      // Load fake data
      var data = require(fixture);
      process.nextTick(function() {
        callback({headers: data.headers}, data.data);
      });
    };
    done();
  });

  it('should instantiate correct ELMO content service', function() {
    elmoContentService = new ELMOContentService({});
    expect(elmoContentService).to.be.instanceOf(ContentService);
    expect(elmoContentService).to.be.instanceOf(ELMOContentService);
  });

  it('should fetch empty content', function(done) {
    elmoContentService = new ELMOContentService({url: './fixtures/elmo-0.json'});
    elmoContentService.fetch(function(err, lastReportDate) {
      expect(err).to.be.null;
      expect(lastReportDate).to.be.null;
    });
    expectToNotEmitReport(elmoContentService, done);
    elmoContentService.once('error', done);
    setTimeout(done, 500);
  });

  it('should fetch mock content from ELMO', function(done) {
    elmoContentService = new ELMOContentService({url: './fixtures/elmo-1.json'});
    elmoContentService.fetch(function(err, lastReportDate) {
      expect(err).to.be.null;
      expect(lastReportDate).to.equal(Date.parse('2014-06-17T15:00:00Z'));
    });
    var remaining = 2;
    elmoContentService.on('report', function(report_data) {
      expect(report_data).to.have.keys(['authoredAt', 'fetchedAt', 'content', 'author']);
      switch (remaining) {
        case 2:
          expect(report_data.content).to.contain('FOO: Certainly&nbsp;&nbsp;&nbsp;&nbsp; BAR: Nope&nbsp;&nbsp;&nbsp;&nbsp; BAZ: Perhaps');
          expect(report_data.author).to.equal(1);
          break;
        case 1:
          expect(report_data.content).to.contain('FOO2: Yes&nbsp;&nbsp;&nbsp;&nbsp; BAR2: No&nbsp;&nbsp;&nbsp;&nbsp; BAZ2: Maybe');
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
    elmoContentService.url = './fixtures/elmo-2.json';
    elmoContentService.fetch(function(err, lastReportDate) {
      expect(err).to.be.null;
      expect(lastReportDate).to.equal(Date.parse('2014-06-17T20:00:00Z'));
    });
    var remaining = 1;
    elmoContentService.on('report', function(report_data) {
      expect(report_data).to.have.keys(['authoredAt', 'fetchedAt', 'content', 'author']);
      switch (remaining) {
        case 1:
          expect(report_data.content).to.contain('FOO3: Affirmative&nbsp;&nbsp;&nbsp;&nbsp; BAR3: Negative&nbsp;&nbsp;&nbsp;&nbsp; BAZ3: Doubtful');
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

  it('should query paginated content', function(done) {
    elmoContentService = new ELMOContentService({url: './fixtures/elmo-3-1.json'});
    elmoContentService.fetch(function(err, lastReportDate) {
      expect(err).to.be.null;
      expect(lastReportDate).to.equal(Date.parse('2014-06-17T15:00:00Z'));
    });
    var remaining = 2;
    elmoContentService.on('report', function(report_data) {
      expect(report_data).to.have.keys(['authoredAt', 'fetchedAt', 'content', 'author']);
      switch (remaining) {
        case 2:
          expect(report_data.content).to.contain('FOO: Certainly&nbsp;&nbsp;&nbsp;&nbsp; BAR: Nope&nbsp;&nbsp;&nbsp;&nbsp; BAZ: Perhaps');
          expect(report_data.author).to.equal(1);
          break;
        case 1:
          expect(report_data.content).to.contain('FOO2: Yes&nbsp;&nbsp;&nbsp;&nbsp; BAR2: No&nbsp;&nbsp;&nbsp;&nbsp; BAZ2: Maybe');
          expect(report_data.author).to.equal(2);
          break;
      }
      if (--remaining === 0) setTimeout(done, 100);
      else if (remaining < 0) done(new Error('Unexpected report'));
    });
    elmoContentService.once('error', done);
  });

  describe('Online', function() {
    before(function() {
      // Restore original `_fetchPage()`
      ELMOContentService.prototype._fetchPage = _fetchPage;
      elmoContentService = new ELMOContentService({url: 'https://secure1.sassafras.coop/api/v1/responses.json?form_id=19'});
    });

    it('should fetch real content from ELMO', function(done) {
      elmoContentService.fetch(function(err, lastReportDate) {
      expect(err).to.be.null;
      expect(lastReportDate).to.exist;
    });
      elmoContentService.once('report', function(report_data) {
        expect(report_data).to.have.keys(['authoredAt', 'fetchedAt', 'content', 'author']);
        done();
      });
      elmoContentService.on('error', done);
    });

    it('should re-fetch to get an empty content list', function(done) {
      elmoContentService.fetch(function(err, lastReportDate) {
        expect(err).to.be.null;
        expect(lastReportDate).to.exist;
      });
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
