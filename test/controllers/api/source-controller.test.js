var request = require('supertest');
var expect = require('chai').expect;
var sourceController = require('../../../controllers/api/source-controller');

describe('Source controller', function() {
  before(function(done) {
    source = {
      type: 'dummy',
      keywords: 't'
    };
    done();
  });

  describe('POST /api/source', function() {
    it('should create a new source', function(done) {
      request(sourceController)
        .post('/api/source')
        .send(source)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          source._id = res.body._id;
          done();
        });
    });
  });

  describe('GET /api/source/:id', function() {
    it('should return source', function(done) {
      request(sourceController)
        .get('/api/source/' + source._id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          compare.call(this, res.body, source);
          done();
        });
    });
  });

  //*describe('PUT /api/source/:id', function() {
    //*it('should update source', function(done) {
      //*source.displayName = 'Updated test source';
      //*request(sourceController)
        //*.put('/api/source/' + source._id)
        //*.send(source)
        //*.expect(200)
        //*.end(function(err, res) {
          //*if (err) return done(err);
          //*compare.call(this, res.body, source);
          //*done();
        //*});
    //*});
  //*});

  //*describe('GET /api/source', function() {
    //*it('should get a list of all sources', function(done) {
      //*request(sourceController)
        //*.get('/api/source')
        //*.expect(200)
        //*.end(function(err, res) {
          //*if (err) return done(err);
          //*expect(res.body).to.have.length(1);
          //*compare(res.body[0], source);
          //*done();
        //*});
    //*});
  //*});

  describe('DELETE /api/source/:id', function() {
    it('should delete source', function(done) {
      request(sourceController)
        .del('/api/source/' + source._id)
        .expect(200)
        .end(function(err, res) {
          request(sourceController)
            .get('/api/source/' + source._id)
            .expect(404, done);
        });
    });
  });

});

var compare = function(a, b) {
  for (var attr in a) {
    if (b[attr]) {
      expect(a[attr]).to.equal(b[attr]);
    }
  }
}
