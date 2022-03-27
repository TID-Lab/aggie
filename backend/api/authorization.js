// Sets up authorization, using connect user npm module.
var ConnectRoles = require('connect-roles');
const _ = require("underscore");
const User = require("../models/user");
const config = require('../config/secrets.json')

//https://github.com/ForbesLindesay/connect-roles
var user = new ConnectRoles({
  // Function to customize code that runs when user fails authorization
  failureHandler: function(req, res, action) {
    var error = new Error.AccessDenied('You do not have permission to ' + action);
    res.send(error.status, error.message);
  }
});

// Create access rules for each of the permissions
_.each(_.keys(User.permissions), function(permission) {
  user.use(permission, function(req) {
    if (req.user && User.can(req.user, permission)) {
      return true;
    }
  });
});

// Admins have all privileges
user.use(function(req) {
  if (req.user && req.user.is('admin')) {
    return true;
  }
});

// Allow all for adminParty
user.use(function() {
  if (config.adminParty) return true;
});

module.exports = user;