// Represents a user of the system.
var database = require('../database');
const mongoose = database.mongoose;
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const config = require('../config/secrets.json');
require('dotenv').config()

var userSchema = new Schema({
  provider: { type: String, default: 'local' },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  hasDefaultPassword: { type: Boolean, default: true },
  role: { type: String, default: 'viewer' },
  active: { type: Boolean, default: true },
  attempts: { type: Number, default: 0 },
  last: { type: Date }
});

userSchema.plugin(passportLocalMongoose, {
  usernameLowerCase: true,
});

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
User.can = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    if (process.env.ADMIN_PARTY.toLowerCase() === "true") {
      next();
    }
    User.findById(user.id, (err, foundUser) => {
      if (err) {
        res.status(422).send("No user found.");
        return next(err);
      }
      if (User.permissions[permission]) {
        if (User.permissions[permission].indexOf(foundUser.role) > -1) {
          return next();
        }
      }
      res.status(401).send("You are not authorized to " + permission + ".");
    });
  };
};

module.exports = User;
