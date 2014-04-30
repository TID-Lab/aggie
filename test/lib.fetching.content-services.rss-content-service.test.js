require('./init');
var expect = require('chai').expect;
var RSSContentService = require('../lib/fetching/content-services/rss-content-service');

describe('RSS content service', function() {
  before(function(done) {
    rssContentService = new RSSContentService({url: 'http://www.news.gatech.edu/rss/all'});
    done();
  });

  it('should fetch content from RSS', function(done) {
    rssContentService.on('report', function(report_data) {
      expect(report_data).to.have.property('content');
      expect(report_data).to.have.property('url');
      expect(report_data.url).to.contain('news.gatech.edu');
    });
    rssContentService.fetch(function(err) {
      if (err) return done(err);
      done();
    });
  });

});
