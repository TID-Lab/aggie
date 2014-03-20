var request = require('supertest');
var expect = require('chai').expect;

// Change database
var api = require('../../../controllers/api');
api.mongoose.disconnect(function() {
  api.mongoose.connect('mongodb://localhost/aggie-test');
});

var userController = require('../../../controllers/api/user-controller');

describe('User controller', function() {
  before(function(done) {
    user = {
      provider: 'test',
      id: 'test-user',
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'letmein'
    };
    done();
  });

  describe('POST /api/user', function() {
    it('should create a new user', function(done) {
      request(userController)
        .post('/api/user')
        .send(user)
        .expect(200, done);
    });
  });

  describe('GET /api/user/:id', function() {
    it('should return user', function(done) {
      request(userController)
        .get('/api/user/' + user.id)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          compare.call(this, res.body, user);
          done();
        });
    });
  });

  describe('PUT /api/user/:id', function() {
    it('should update user', function(done) {
      user.displayName = 'Updated test user';
      request(userController)
        .put('/api/user/' + user.id)
        .send(user)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          compare.call(this, res.body, user);
          done();
        });
    });
  });

  describe('GET /api/user', function() {
    it('should get a list of all users', function(done) {
      request(userController)
        .get('/api/user')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.length(1);
          compare(res.body[0], user);
          done();
        });
    });
  });

  describe('DELETE /api/user/:id', function() {
    it('should delete user', function(done) {
      request(userController)
        .del('/api/user/' + user.id)
        .expect(200)
        .end(function(err, res) {
          request(userController)
            .get('/api/user')
            .expect(200, [], done);
        });
    });
  });

});

var compare = function(a, b) {
  for (var attr in a) {
    if (attr === 'password') {
      expect(a[attr]).to.not.equal(b[attr]);
    } else if (b[attr]) {
      expect(a[attr]).to.equal(b[attr]);
    }
  }
}
