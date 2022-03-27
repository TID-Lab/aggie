// Represents a user of the system.
var database = require('../database');
const mongoose = database.mongoose;
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
  provider: { type: String, default: 'local' },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  hasDefaultPassword: { type: Boolean, default: true },
  role: { type: String, default: 'viewer' }
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', userSchema);

User.permissions = {
  'manage trends': ['admin'],
  'view data': ['viewer', 'monitor', 'admin'],
  'edit data': ['monitor', 'admin'],
  'change settings': ['admin'],
  'view users': ['viewer', 'monitor', 'admin'],
  'view other users': ['manager', 'admin'],
  'update users': ['viewer', 'monitor', 'admin'],
  'admin users': ['admin'],
  'change admin password': ['admin'],
  'edit tags': ['manager', 'admin']
};

// Determine if a user can do a certain action
User.can = function(user, permission) {
  if (User.permissions[permission]) {
    return User.permissions[permission].indexOf(user.role) > -1;
  }
  return false;
};

module.exports = User;
