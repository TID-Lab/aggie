// Represents a user of the system.

var database = require('../lib/database');
var mongoose = database.mongoose;
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var email = require('email');
var _ = require('underscore');
var logger = require('../lib/logger');

var SALT_WORK_FACTOR = 10;

var userSchema = new mongoose.Schema({
  provider: { type: String, default: 'local' },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  hasDefaultPassword: { type: Boolean, default: true },
  role: { type: String, default: 'viewer' }
});

userSchema.pre('save', function(next) {
  var user = this;

  if (!user.email) return next(new Error.Validation('email_required'));
  if (!user.username) return next(new Error.Validation('username_required'));
  if (!email.isValidAddress(user.email)) return next(new Error.Validation('email_invalid'));
  if (user.password && user.password.length < User.PASSWORD_MIN_LENGTH) return next(new Error.Validation('password_too_short'));

  // Check for uniqueness in certain fields
  User.checkUnique(user, function(unique, errors) {
    if (!unique) return next(new Error.Validation(errors[0]));

    // Re-hash password if necessary
    if (user.isModified('password')) {
      user.hashPassword(next);
    } else {
      process.nextTick(next);
    }
  });
});

userSchema.post('save', function(user) {
  // Nullify the password once save is done, for security.
  user.password = null;
});

userSchema.methods.hashPassword = function(callback) {
  var user = this;
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
};

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

var User = mongoose.model('User', userSchema);

User.checkUnique = function(user, callback) {
  var errors = [];
  var queries = [];
  _.each(userSchema.tree, function(meta, field) {
    var query = { $and: [{
      _id: { $ne: user._id }
    }] };
    var filter = {};
    filter[field] = user[field];
    query.$and.push(filter);
    if (meta.unique) queries.push(query);
  });
  var remaining = queries.length;
  _.each(queries, function(query) {
    User.count(query, function(err, count) {
      if (err) {
        logger.warning(err);
      }
      if (count) errors.push(_.keys(_.last(query.$and))[0] + '_not_unique');
      if (--remaining === 0) callback(!errors.length, errors);
    });
  });
};

// Mixin shared user methods
var Shared = require('../shared/user');
for (var static in Shared) User[static] = Shared[static];
for (var proto in Shared.prototype) userSchema.methods[proto] = Shared[proto];

module.exports = User;
