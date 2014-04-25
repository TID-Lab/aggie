var database = require('../lib/database');
var mongoose = database.mongoose;
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var email = require('email');

var SALT_WORK_FACTOR = 10;
var PASSWORD_MIN_LENGTH = 6;

var userSchema = new mongoose.Schema({
  provider: {type: String, default: 'local'},
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true}
});

// Hash the password for security
userSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();
  if (!email.isValidAddress(user.email)) return next(new Error.Validation('email_invalid'));
  if (user.password.length < PASSWORD_MIN_LENGTH) return next(new Error.Validation('password_too_short'));

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

// Get URL to a user's gravatar
userSchema.methods.gravatar = function(size, defaults) {
  if (!size) size = 200;
  if (!defaults) defaults = 'retro';

  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=' + defaults;
  }

  var md5 = crypto.createHash('md5').update(this.email);
  return 'https://gravatar.com/avatar/' + md5.digest('hex').toString() + '?s=' + size + '&d=' + defaults;
};

module.exports = mongoose.model('User', userSchema);
