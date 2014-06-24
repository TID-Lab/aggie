require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var incidentController = require('../lib/api/v1/incident-controller')();
var Incident = require('../models/incident');
var Report = require('../models/report');

var incident, oneIncident, one, two;
describe('Incident controller', function() {
  before(function(done) {
    Incident.addListeners('reports', Report.schema);
    incident = {title: 'test'};
    done();
  });

  describe('POST /api/v1/incident', function() {
    it('should create a new incident', function(done) {
      request(incidentController)
        .post('/api/v1/incident')
        .send(incident)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          expect(res.body).to.have.property('updatedAt');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('verified');
          incident._id = res.body._id;
          compare.call(this, res.body, incident);
          done();
        });
    });
  });

  describe('GET /api/v1/incident/:_id', function() {
    it('should return incident', function(done) {
      request(incidentController)
        .get('/api/v1/incident/' + incident._id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          compare.call(this, res.body, incident);
          done();
        });
    });
  });

  describe('PUT /api/v1/incident/:_id', function() {
    it('should update incident', function(done) {
      incident.status = 'working';
      request(incidentController)
        .put('/api/v1/incident/' + incident._id)
        .send(incident)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          compare.call(this, res.body, incident);
          done();
        });
    });
    it('should whitelist status values', function(done) {
      request(incidentController)
        .put('/api/v1/incident/' + incident._id)
        .send({status: 'undefined'})
        .expect(422, 'status_error', done);
    });
  });

  describe('GET /api/v1/incident', function() {
    it('should get a list of all incidents', function(done) {
      request(incidentController)
        .get('/api/v1/incident')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['total', 'results']);
          expect(res.body.results).to.be.an.instanceof(Array);
          expect(res.body.results).to.not.be.empty;
          compare(_.findWhere(res.body.results, {_id: incident._id}), incident);
          done();
        });
    });
    it('should get a filtered list of incidents', function(done) {
      request(incidentController)
        .get('/api/v1/incident?status=working')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['total', 'results']);
          expect(res.body.results).to.be.an.instanceof(Array);
          expect(res.body.results).to.not.be.empty;
          compare(_.findWhere(res.body.results, {_id: incident._id}), incident);
          done();
        });
    });
    it('should get an empty list of incidents', function(done) {
      request(incidentController)
        .get('/api/v1/incident?status=alert')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['total', 'results']);
          expect(res.body.total).to.equal(0);
          expect(res.body.results).to.be.an.instanceof(Array);
          expect(res.body.results).to.be.empty;
          done();
        });
    });
    it('should count the number of reports per incident', function(done) {
      one = new Report({content: 'one', _incident: incident._id});
      two = new Report({content: 'two', _incident: incident._id});
      one.save();
      two.save();
      setTimeout(function() {
        request(incidentController)
          .get('/api/v1/incident')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.have.keys(['total', 'results']);
            expect(res.body.results).to.be.an.instanceof(Array);
            expect(res.body.results[0]).to.contain.property('reportCount');
            expect(res.body.results[0].reportCount).to.equal(2);
            done();
          });
      }, 100);
    });
    it('should update the number of reports per incident when changing report incident', function(done) {
      oneIncident = new Incident({title: 'one'});
      oneIncident.save(function(err) {
        if (err) return done(err);
        one._incident = oneIncident._id;
        one.save(function(err) {
          if (err) return done(err);
          setTimeout(function() {
            request(incidentController)
              .get('/api/v1/incident')
              .expect(200)
              .end(function(err, res) {
                if (err) return done(err);
                expect(res.body).to.have.keys(['total', 'results']);
                expect(res.body.results).to.be.an.instanceof(Array);
                _.each(res.body.results, function(result) {
                  switch (result._id) {
                    case incident._id:
                    case oneIncident._id:
                      expect(result).to.contain.property('reportCount');
                      expect(result.reportCount).to.equal(1);
                      break;
                  }
                });
                done();
              });
          }, 100);
        });
      });
    });
    it('should update the number of reports per incident when removing from report', function(done) {
      one._incident = null;
      one.save(function(err) {
        if (err) return done(err);
        setTimeout(function() {
          request(incidentController)
            .get('/api/v1/incident')
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              expect(res.body).to.have.keys(['total', 'results']);
              expect(res.body.results).to.be.an.instanceof(Array);
              _.each(res.body.results, function(result) {
                switch (result._id) {
                  case incident._id:
                    expect(result).to.contain.property('reportCount');
                    expect(result.reportCount).to.equal(1);
                    break;
                  case oneIncident._id:
                    expect(result).to.contain.property('reportCount');
                    expect(result.reportCount).to.equal(0);
                    break;
                }
              });
              done();
            });
        }, 100);
      });
    });
  });

  describe('DELETE /api/v1/incident/:_id', function() {
    it('should delete incident', function(done) {
      request(incidentController)
        .del('/api/v1/incident/' + incident._id)
        .expect(200)
        .end(function(err, res) {
          request(incidentController)
            .get('/api/v1/incident/' + incident._id)
            .expect(404, done);
        });
    });
  });

  describe('DELETE /api/v1/incident/_all', function() {
    it('should delete all incidents', function(done) {
      request(incidentController)
        .del('/api/v1/incident/_all')
        .expect(200)
        .end(function(err, res) {
          request(incidentController)
            .get('/api/v1/incident')
            .expect(200, {total: 0, results: []}, done);
        });
    });
  });
});
