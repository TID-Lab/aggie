var utils = require('./init');
var chai = require('chai');
var should = chai.should();
var SMTCTag = require('../../backend/models/tag');

describe('SMTCTag attributes', function() {
    before(function(done) {
        tag = new SMTCTag({
            name: 'disinformation'
        });
        done();
    });

    it('name should be a string', function() {
        tag.name.should.be.a('string');
    });

    it('should save a tag', function(done) {
        tag.save(done);
    });

    it('should find our newly created tag', function(done) {
        SMTCTag.findOne({ name: tag.name }, function(err, tag) {
            should.exist(tag);
            tag.name.should.equal('disinformation');
            done();
        })
    });

    it('should not allow tags with duplicate name', function(done) {
        var dupe = new SMTCTag({ name: 'disinformation' });
        dupe.save(function(err) {
            err.status.should.equal(422);
            err.message.should.equal('name_not_unique');
            done();
        });
    });

    after(utils.wipeModels([SMTCTag]));
    after(utils.expectModelsEmpty);
})