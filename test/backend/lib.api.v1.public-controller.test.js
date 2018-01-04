var expect = require('chai').expect;
var request = require('supertest');
var publicController = require('../../lib/api/v1/public-controller');
var Incident = require('../../models/incident');

describe('Public controller', function() {
  var incident = [];

  before(function(done) {
    incident.push({
      title: 'test',
      public: true
    });

    incident.push({
      title: 'test',
      public: false
    });

    incident.push({
      title: 'test',
      public: true
    });

    incident.forEach(function(item) {
      Incident.create(item);
    });

    done();
  });

  after(function(done) {
    Incident.remove({}, done);
  });

  describe('GET /api/v1/public/incident', function() {
    it('should return the public incidents', function(done) {
      request(publicController)
        .get('/api/v1/public/incident')
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
