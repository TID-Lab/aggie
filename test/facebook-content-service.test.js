var expect = require('chai').expect;
var should = require('chai').should();
var FacebookContentService = require('../controllers/fetching/content-services/facebook-content-service');
var ContentService = require('../controllers/fetching/content-service');

describe('Facebook content service', function() {
    before(function(done) {
        facebookContentService = new FacebookContentService({fbPage:'52193296770'});
        done();
    });

    it('should instantiate correct facebook content service', function() {
        expect(facebookContentService).to.be.instanceOf(ContentService);
        expect(facebookContentService).to.be.instanceOf(FacebookContentService);
    });

    it('should fetch content from Facebook', function() {
        facebookContentService.fetch();
        facebookContentService.on('report', function(report_data) {
            expect(report_data).to.have.property('fetchedAt');
            expect(report_data).to.have.property('createdAt');
            expect(report_data).to.have.property('authoredAt');
            expect(report_data).to.have.property('id');
            expect(report_data).to.have.property('author');
            expect(report_data).to.have.property('url');
            // console.log('------------------');
            // console.log(report_data);
            // console.log('------------------');
        });
    });
});

