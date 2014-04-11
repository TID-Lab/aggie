var expect = require('chai').expect;
var should = require('chai').should();
var FacebookContentService = require('../controllers/fetching/content-services/facebook-content-service');
var ContentService = require('../controllers/fetching/content-service');

describe('Facebook content service', function() {
    before(function(done) {
        facebookContentService = new FacebookContentService({lastCrawlDate: undefined, fbPage:'52193296770'});
        done();
    });

    it('should instantiate correct facebook content service', function() {
        expect(facebookContentService).to.be.instanceOf(ContentService);
        expect(facebookContentService).to.be.instanceOf(FacebookContentService);
    });

    it('should fetch content from Facebook', function(done) {
        var data = facebookContentService.fetch();
        should.not.exist(data);
        // facebookContentService.should.have.property('lastCrawlDate');
        // // Stop stream to ensure a single fetch
        // facebookContentService.setCrawlDate("2013");
        // (facebookContentService.should.have.property('lastCrawlDate')).to.equal("2013");
        done();
    });
});

describe('Facebook content 1 weeks ago', function() {
    before(function(done) {
        facebookContentService = new FacebookContentService({lastCrawlDate: Math.round(Date.now()/1000), fbPage:'52193296770'});
        done();
    });

    it('should fetch content from Facebook', function(done) {
        var data = facebookContentService.fetch();
        should.not.exist(data);
        // facebookContentService.should.have.property('lastCrawlDate');
        // // Stop stream to ensure a single fetch
        // facebookContentService.setCrawlDate("2013");
        // (facebookContentService.should.have.property('lastCrawlDate')).to.equal("2013");
        done();
    });
});
