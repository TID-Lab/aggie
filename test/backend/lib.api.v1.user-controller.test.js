var utils = require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var userController = require('../../lib/api/controllers/user-controller')();
var User = require('../../models/user');
var users;

describe('User controller', function() {
  // Create some users.
  beforeEach(function(done) {
    User.create([
      { provider: 'test', email: 'foo@example.com', username: 'foo', password: 'letmein2' },
      { provider: 'test', email: 'bar@example.com', username: 'bar', password: 'letmein3' }
    ], function(err, _users) {
      users = _users;
      done(err);
    });
  });

  // Clearing the db should eventually move to a global afterEach, but for now
  // it's here else we'd break existing tests.
  afterEach(utils.removeUsersExceptAdmin);

  describe('GET /api/controllers/user', function() {
    it('should get a list of all users', function(done) {
      request(userController)
        .get('/api/controllers/user')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          // The admin user is always around, so 2+1=3
          expect(res.body.length).to.equal(3);
          expect(res.body.map((item) => item.username)).to.contain('foo');
          done();
        });
    });
  });

  describe('GET /api/controllers/user/:_id', function() {
    it('should return user', function(done) {
      request(userController)
        .get('/api/controllers/user/' + users[1]._id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.username).to.equal('bar');
          expect(res.body).to.not.have.property('password');
          done();
        });
    });
  });

  describe('POST /api/controllers/user', function() {
    it('should create a new user', function(done) {
      request(userController)
        .post('/api/controllers/user')
        .send({ provider: 'test', email: 'baz@example.com', username: 'baz', password: 'letmein4' })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          expect(res.body.username).to.equal('baz');
          User.where({ username: 'baz' }).count(function(err, c) {
            expect(c).to.equal(1);
            done();
          });
        });
    });
  });

  describe('PUT /api/controllers/user/:_id', function() {
    it('should update user', function(done) {
      request(userController)
        .put('/api/controllers/user/' + users[0]._id)
        .send({ email: 'updated@example.com' })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.email).to.equal('updated@example.com');
          User.where({ email: 'updated@example.com' }).count(function(err, c) {
            expect(c).to.equal(1);
            done();
          });
        });
    });
  });

  describe('DELETE /api/controllers/user/:_id', function() {
    it('should delete user', function(done) {
      request(userController)
        .del('/api/controllers/user/' + users[0]._id)
        .expect(200)
        .end(function(err, res) {
          request(userController)
            .get('/api/controllers/user/' + users[0]._id)
            .expect(404)
            .end(function(err, res) {
              request(userController)
                .get('/api/controllers/user/' + users[1]._id)
                .expect(200, done);
            });
        });
    });
  });

  after(utils.expectModelsEmpty);
});
