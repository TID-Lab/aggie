require('./init');
var expect = require('chai').expect;
var RSSContentService = require('../lib/fetching/content-services/rss-content-service');
var fs = require('fs');
var path = require('path');

describe('RSS content service', function() {
  before(function(done) {
    // Override fetch stream so that we can test local files
    RSSContentService.prototype._fetchStream = function(callback) {
      var stream =  fs.createReadStream(path.join(__dirname, this.url));
      callback(stream);
    };
    rssContentService = new RSSContentService({url: './fixtures/rss-good-1.xml'});
    done();
  });

  it('should fetch content from RSS', function(done) {
    var reports = [];
    rssContentService.fetch(function(lastPostDate) {
      expect(lastPostDate).to.be.an.instanceof(Date);
      expect(reports).to.have.length(2);
      rssContentService.removeAllListeners('report');
      done();
    });
    rssContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('url');
      expect(report_data.url).to.contain('news.gatech.edu');
      reports.push(report_data);
    });
    rssContentService.on('error', function(err) {
      return done(err);
    });
  });

  it('should fetch more content and avoid duplicates', function(done) {
    var reports = [];
    rssContentService.url = './fixtures/rss-good-2.xml';
    rssContentService.fetch(function(lastPostDate) {
      expect(lastPostDate).to.be.an.instanceof(Date);
      expect(lastPostDate.toString()).to.equal(new Date('Tue Apr 29 2014 20:18:12 GMT').toString());
      expect(reports).to.have.length(2);
      rssContentService.removeAllListeners('report');
      done();
    });
    rssContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('url');
      expect(report_data.url).to.contain('news.gatech.edu');
      reports.push(report_data);
    });
    rssContentService.on('error', function(err) {
      return done(err);
    });
  });

  it('should emit warnings for missing data', function(done) {
    var bad = new RSSContentService({url: './fixtures/rss-bad.xml'});
    var warnings = [];
    bad.fetch(function(lastPostDate) {
      expect(warnings).to.be.an.instanceof(Array);
      expect(warnings).to.have.length(2);
    });
    bad.on('report', function(report_data) {
      done(new Error('No report data should be emitted'));
    });
    bad.on('error', function(err) {
      done(new Error('No errors should be emitted'));
    });
    var remaining = 2;
    bad.on('warning', function(err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.contain('Parse warning');
      warnings.push(err);
      if (--remaining === 0) done();
    });
  });

  it('should emit errors for malformed data', function(done) {
    var ugly = new RSSContentService({url: './fixtures/rss-ugly.xml'});
    ugly.fetch();
    ugly.on('report', function(report_data) {
      done(new Error('No report data should be emitted'));
    });
    ugly.on('warning', function(err) {
      done(new Error('No warnings should be emitted'));
    });
    ugly.on('error', function(err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.contain('Not a feed');
      done();
    });
  });

});
