var expect = require('chai').expect;
var should = require('chai').should();
var FacebookContentService = require('../lib/fetching/content-services/facebook-content-service');
var ContentService = require('../lib/fetching/content-service');

var facebookContentService;
describe('Facebook content service', function() {
  before(function(done) {
    // Override fetch so that we can test local files
    FacebookContentService.prototype.fetch = function(fixture, callback) {
      var self = this;
      var data = require(fixture).data;
      process.nextTick(function() {
        self._handleResults(data);
        callback && callback(null, self.lastReportDate * 1000);
      });
    };
    facebookContentService = new FacebookContentService({fbPage: '251841205227'});
    done();
  });

  it('should instantiate correct facebook content service', function() {
    expect(facebookContentService).to.be.instanceOf(ContentService);
    expect(facebookContentService).to.be.instanceOf(FacebookContentService);
  });

  it('should fetch content from Facebook', function(done) {
    facebookContentService.fetch('./fixtures/facebook-1.json');
    var remaining = 3;
    facebookContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('fetchedAt');
      expect(report_data).to.have.property('authoredAt');
      expect(report_data).to.have.property('author');
      expect(report_data).to.have.property('url');
      if (--remaining === 0) {
        facebookContentService.removeAllListeners('report');
        done();
      }
    });
    facebookContentService.on('error', function(err) {
      facebookContentService.removeAllListeners('report');
      done(err);
    });
  });

  it('should query for new data without duplicates', function(done) {
    facebookContentService.fetch('./fixtures/facebook-2.json');
    var remaining = 2;
    facebookContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('fetchedAt');
      expect(report_data).to.have.property('authoredAt');
      expect(report_data).to.have.property('author');
      expect(report_data).to.have.property('url');
      if (--remaining === 0) {
        // Wait so that we can catch duplicate reports
        setTimeout(function() {
          facebookContentService.removeAllListeners('report');
          done();
        }, 100);
      } else if (remaining < 0) {
        return done(new Error('Duplicate report'));
      }
    });
    facebookContentService.on('error', function(err) {
      facebookContentService.removeAllListeners('report');
      done(err);
    });
  });
});

