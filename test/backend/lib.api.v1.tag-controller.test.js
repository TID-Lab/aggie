var utils = require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var tagController = require('../../backend/api/controllers/tagController')();
var SMTCTag = require('../../backend/models/tag');
var tags;

describe('Tag controller', function() {
    // Create some tags.
    beforeEach(function(done) {
        SMTCTag.create([
            { name: 'foo' },
            { name: 'bar' }
        ], function (err, _tags) {
            tags = _tags;
            done(err);
        })
    });

    afterEach(utils.wipeModels([ SMTCTag ]));

    describe('GET /api/controllers/tag', function() {
        it('should get a list of all tags', function(done) {
            request(tagController)
                .get('/api/controllers/tag')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.length).to.equal(2);
                    expect(res.body.map((item) => item.name)).to.contain('foo');
                    done();
                });
        });
    });

    describe('POST /api/controllers/tag', function() {
        it('should create a new tag', function(done) {
            request(tagController)
                .post('/api/controllers/tag')
                .send({ name: 'baz' })
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body).to.have.property('_id');
                    expect(res.body.name).to.equal('baz');
                    SMTCTag.where({ name: 'baz' }).count(function(err, c) {
                        expect(c).to.equal(1);
                        done();
                    });
                })
        });
    });

    describe('DELETE /api/controllers/tag/:_id', function() {
        it('should delete tag', function(done) {
            request(tagController)
                .delete('/api/controllers/tag/' + tags[0]._id)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    request(tagController)
                    .get('/api/controllers/tag')
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);
                        expect(res.body.length).to.equal(1);
                        expect(res.body[0].name).to.equal('bar');
                        done();
                    });
                })
        })
    });
});