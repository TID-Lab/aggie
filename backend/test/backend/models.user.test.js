var utils = require('./init');
var chai = require('chai');
var should = chai.should();
var User = require('../../models/user');

describe('User attributes', function() {
  before(function(done) {
    user = new User({
      username: 'test',
      email: 'janedoe@gmail.com',
      password: 'password'
    });
    done();
  });

  it('email should be a string', function() {
    user.email.should.be.a('string');
  });

  it('password should be a string', function() {
    user.password.should.be.a('string');
  });

  it('should save a user', function(done) {
    user.save(done);
  });

  it('should find our newly created user', function(done) {
    User.findOne({ email: user.email }, function(err, user) {
      should.exist(user);
      user.email.should.equal('janedoe@gmail.com');
      done();
    });
  });

  it('should not allow users with duplicate username', function(done) {
    var dupe = new User({ username: 'test', email: 'janedoe2@gmail.com', password: 'password' });
    dupe.save(function(err) {
      err.status.should.equal(422);
      err.message.should.equal('username_not_unique');
      done();
    });
  });

  it('should not allow users with duplicate email', function(done) {
    var dupe = new User({ username: 'test2', email: 'janedoe@gmail.com', password: 'password' });
    dupe.save(function(err) {
      err.status.should.equal(422);
      err.message.should.equal('email_not_unique');
      done();
    });
  });

  after(utils.removeUsersExceptAdmin);
  after(utils.expectModelsEmpty);
});
