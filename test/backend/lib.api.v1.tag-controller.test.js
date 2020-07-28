var utils = require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var tagController = require('../../lib/api/v1/tag-controller')();
var SMTCTag = require('../../models/tag');
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

    describe('GET /api/v1/tag', function() {
        it('should get a list of all tags', function(done) {
            request(tagController)
                .get('/api/v1/tag')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.length).to.equal(2);
                    expect(res.body.map((item) => item.name)).to.contain('foo');
                    done();
                });
        });
    });

    describe('POST /api/v1/tag', function() {
        it('should create a new tag', function(done) {
            request(tagController)
                .post('/api/v1/tag')
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

    describe('DELETE /api/v1/tag/:_id', function() {
        it('should delete tag', function(done) {
            request(tagController)
                .delete('/api/v1/tag/' + tags[0]._id)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    request(tagController)
                    .get('/api/v1/tag')
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