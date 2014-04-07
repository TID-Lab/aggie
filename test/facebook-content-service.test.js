var expect = require('chai').expect;
var should = require('chai').should();
var FacebookContentService = require('../controllers/fetching/content-services/fb-content-service');

describe('Facebook content service', function() {
    before(function(done) {
        facebookContentService = new FacebookContentService({lastCrawlDate: undefined, fbPage:'prezicom'});
        done();
    });

    it('should fetch content from Facebook', function(done) {
        var data = facebookContentService.fetch();
        should.exist(data);
        data.should.be.a('string').to.equal('done');
        // facebookContentService.should.have.property('lastCrawlDate');
        // // Stop stream to ensure a single fetch
        // facebookContentService.setCrawlDate("2013");
        // (facebookContentService.should.have.property('lastCrawlDate')).to.equal("2013");
        done();
    });
});

describe('Facebook content 1 weeks ago', function() {
    before(function(done) {
        facebookContentService = new FacebookContentService({lastCrawlDate: new Date(2014, 3, 1).toISOString(), fbPage:'prezicom'});
        done();
    });

    it('should fetch content from Facebook', function(done) {
        var data = facebookContentService.fetch();
        should.exist(data);
        data.should.be.a('string').to.equal('done');
        // facebookContentService.should.have.property('lastCrawlDate');
        // // Stop stream to ensure a single fetch
        // facebookContentService.setCrawlDate("2013");
        // (facebookContentService.should.have.property('lastCrawlDate')).to.equal("2013");
        done();
    });
});
