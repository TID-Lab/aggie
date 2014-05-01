require('./init');
var expect = require('chai').expect;
var RSSContentService = require('../lib/fetching/content-services/rss-content-service');

describe('RSS content service', function() {
  before(function(done) {
    rssContentService = new RSSContentService({url: 'http://localhost:3001/rss-good-1.xml'});
    done();
  });

  it('should fetch content from RSS', function(done) {
    var reports = [];
    rssContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('url');
      expect(report_data.url).to.contain('news.gatech.edu');
      reports.push(report_data);
    });
    rssContentService.fetch(function(err, lastPostDate) {
      if (err) return done(err);
      expect(lastPostDate).to.be.an.instanceof(Date);
      expect(reports).to.have.length(2);
      rssContentService.removeAllListeners('report');
      done();
    });
  });

  it('should fetch more content and avoid duplicates', function(done) {
    var reports = [];
    rssContentService.url = 'http://localhost:3001/rss-good-2.xml';
    rssContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('url');
      expect(report_data.url).to.contain('news.gatech.edu');
      reports.push(report_data);
    });
    rssContentService.fetch(function(err, lastPostDate) {
      if (err) return done(err);
      expect(lastPostDate).to.be.an.instanceof(Date);
      expect(reports).to.have.length(2);
      rssContentService.removeAllListeners('report');
      done();
    });
  });

  it('should emit warnings for missing data', function(done) {
    var bad = new RSSContentService({url: 'http://localhost:3001/rss-bad.xml'});
    bad.on('report', function(report_data) {
      done(new Error('No report data should be emitted'));
    });
    bad.on('error', function(err) {
      done(new Error('No errors should be emitted'));
    });
    bad.on('warning', function(err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.contain('Parse warning');
    });
    bad.fetch(function(warnings, lastPostDate) {
      expect(warnings).to.be.an.instanceof(Array);
      expect(warnings).to.have.length(2);
      done();
    });
  });

  it('should emit errors for malformed data', function(done) {
    var ugly = new RSSContentService({url: 'http://localhost:3001/rss-ugly.xml'});
    ugly.on('report', function(report_data) {
      done(new Error('No report data should be emitted'));
    });
    ugly.on('warning', function(err) {
      done(new Error('No warnings should be emitted'));
    });
    ugly.on('error', function(err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.contain('Not a feed');
    });
    ugly.fetch(function(warnings, lastPostDate) {
      if (warnings) return done(new Error('No warnings should be logged'));
      done();
    });
  });

});
