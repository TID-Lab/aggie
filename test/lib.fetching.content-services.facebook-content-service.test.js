var expect = require('chai').expect;
var should = require('chai').should();
var FacebookContentService = require('../lib/fetching/content-services/facebook-content-service');
var ContentService = require('../lib/fetching/content-service');

var facebookContentService, _fetch;
describe('Facebook content service', function() {
  before(function(done) {
    // Override fetch so that we can test local files
    _fetch = FacebookContentService.prototype.fetch;
    FacebookContentService.prototype.fetch = function(fixture, callback) {
      var self = this;
      var data = require(fixture);
      process.nextTick(function() {
        self._handleResults(data.posts, data.authors);
        callback && callback(null, self.lastReportDate * 1000);
      });
    };
    facebookContentService = new FacebookContentService({});
    done();
  });

  it('should instantiate correct facebook content service', function() {
    expect(facebookContentService).to.be.instanceOf(ContentService);
    expect(facebookContentService).to.be.instanceOf(FacebookContentService);
  });

  it('should fetch empty content', function(done) {
    facebookContentService.fetch('./fixtures/facebook-0.json');
    expectToNotEmitReport(facebookContentService, done);
    facebookContentService.once('error', function(err) {
      done(err);
    });
    setTimeout(function() {
      done();
    }, 100);
  });

  it('should fetch mock content from Facebook', function(done) {
    facebookContentService.fetch('./fixtures/facebook-1.json');
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
    facebookContentService.fetch('./fixtures/facebook-2.json');
    var remaining = 3;
    facebookContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('fetchedAt');
      expect(report_data).to.have.property('authoredAt');
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('author');
      expect(report_data).to.have.property('url');
      switch (remaining) {
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
          break;
      }
      if (--remaining === 0) {
        // Wait so that we can catch duplicate reports
        setTimeout(function() {
          done();
        }, 100);
      } else if (remaining < 0) {
        return done(new Error('Duplicate report'));
      }
    });
    facebookContentService.once('error', function(err) {
      done(err);
    });
  });

  describe('Online', function() {
    before(function() {
      // Restore original fetch()
      FacebookContentService.prototype.fetch = _fetch;
      facebookContentService = new FacebookContentService({url: 'http://www.facebook.com/georgiatech'});
    });

    it('should fetch real content from Facebook', function(done) {
      facebookContentService.fetch();
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

  afterEach(function() {
    facebookContentService.removeAllListeners();
  });
});

function expectToNotEmitReport(listener, done) {
  listener.once('report', function(report_data) {
    done(new Error('Should not emit reports'));
  });
}

function expectToEmitError(listener, message, done) {
  listener.once('error', function(err) {
    expect(err).to.be.an.instanceof(Error);
    expect(err.message).to.contain(message);
    done();
  });
}
