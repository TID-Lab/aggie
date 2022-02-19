var utils = require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var groupController = require('../../backend/api/controllers/group-controller')();
var Group = require('../../backend/models/group');

describe('Group controller', function() {
  var group;
  before(function(done) {
    group = { title: 'test' };
    done();
  });

  describe('POST /api/controllers/group', function() {
    it('should create a new group', function(done) {
      request(groupController)
        .post('/api/controllers/group')
        .send(group)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          expect(res.body).to.have.property('updatedAt');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('veracity');
          expect(res.body).to.have.property('tags');
          group._id = res.body._id;
          utils.compare(res.body, group);
          done();
        });
    });
  });

  describe('GET /api/controllers/group/:_id', function() {
    it('should return group', function(done) {
      request(groupController)
        .get('/api/controllers/group/' + group._id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          utils.compare(res.body, group);
          done();
        });
    });
  });

  describe('PUT /api/controllers/group/:_id', function() {
    it('should update group', function(done) {
      group.status = 'working';
      request(groupController)
        .put('/api/controllers/group/' + group._id)
        .send(group)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          utils.compare(res.body, group);
          done();
        });
    });
    it('should whitelist status values', function(done) {
      request(groupController)
        .put('/api/controllers/group/' + group._id)
        .send({ status: 'undefined' })
        .expect(422, 'status_error', done);
    });
  });

  describe('GET /api/controllers/group', function() {
    it('should get a list of all groups', function(done) {
      request(groupController)
        .get('/api/controllers/group')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['total', 'results']);
          expect(res.body.results).to.be.an.instanceof(Array);
          expect(res.body.results).to.not.be.empty;
          utils.compare(_.findWhere(res.body.results, { _id: group._id }), group);
          done();
        });
    });
    it('should get a filtered list of groups', function(done) {
      request(groupController)
        .get('/api/controllers/group?status=working')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['total', 'results']);
          expect(res.body.results).to.be.an.instanceof(Array);
          expect(res.body.results).to.not.be.empty;
          utils.compare(_.findWhere(res.body.results, { _id: group._id }), group);
          done();
        });
    });
    it('should get an empty list of groups', function(done) {
      request(groupController)
        .get('/api/controllers/group?title=notexistingtitle')
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
  });

  describe('DELETE /api/controllers/group/', function() {
    var groups;
    beforeEach(function(done) {
      Group.create(
        { authoredAt: new Date(), title: 'First group' },
        { authoredAt: new Date(), title: 'Second group' },
        { authoredAt: new Date(), title: 'Third group' },
        function(err, inc1, inc2, inc3) {
          groups = [inc1, inc2, inc3];
          done(err);
        });
    });

    afterEach(function(done) {
      Group.remove({}, done);
    });

    it(':id should delete group with id', function(done) {
      request(groupController)
        .del('/api/controllers/group/' + groups[0]._id)
        .expect(200)
        .end(function(err, res) {
          request(groupController)
            .get('/api/controllers/group/' + groups[0]._id)
            .expect(404, done);
        });
    });

    it('_all should delete all groups', function(done) {
      request(groupController)
        .del('/api/controllers/group/_all')
        .expect(200)
        .end(function(err, res) {
          request(groupController)
            .get('/api/controllers/group')
            .expect(200, { total: 0, results: [] }, done);
        });
    });

    it('_selected should delete selected groups', function(done) {
      request(groupController)
        .post('/api/controllers/group/_selected')
        .send({ ids: [groups[0]._id, groups[1]._id] })
        .expect(200)
        .end(function(err, res) {
          request(groupController)
            .get('/api/controllers/group')
            .expect(200)
            .end(function(err, res) {
              expect(res.body.total).to.equal(1);
              done(err);
            });

        });
    });
  });

  after(utils.expectModelsEmpty);
});
