require('./init');
var expect = require('chai').expect;
var RSSContentService = require('../lib/fetching/content-services/rss-content-service');

describe('RSS content service', function() {
  before(function(done) {
    rssContentService = new RSSContentService({url: 'http://www.news.gatech.edu/rss/all'});
    done();
  });

  it('should fetch content from RSS', function(done) {
    rssContentService.start();
    rssContentService.on('report', function(report_data) {
      console.log(report_data);
      expect(report_data).to.have.property('content');
      // Stop stream to ensure a single fetch
      rssContentService.stop();
      done();
    });
  });

});
