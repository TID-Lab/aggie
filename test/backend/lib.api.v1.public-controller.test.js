var expect = require('chai').expect;
var request = require('supertest');
var publicController = require('../../backend/api/controllers/public-controller');
var Group = require('../../backend/models/group');

describe('Public controller', function() {
  var group = [];

  before(function(done) {
    group.push({
      title: 'test',
      public: true
    });

    group.push({
      title: 'test',
      public: false
    });

    group.push({
      title: 'test',
      public: true
    });

    Group.create(group, function(err) {
      done();
    });
  });

  after(function(done) {
    Group.remove({}, done);
  });

  describe('GET /api/controllers/public/group', function() {
    it('should return the public groups', function(done) {
      request(publicController)
        .get('/api/controllers/public/group')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          expect(res.body).to.have.length(2);
          done();
        });
    });
  });
});
