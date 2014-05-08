var _ = require('underscore');
var express = require('express');
var config = require('../../config/secrets');
var User = require('../../shared/user');

module.exports = function(app, roles) {
  app = app || express();

  // Create access rules for each of the permissions
  _.each(_.keys(User.permissions), function(permission) {
    roles.use(permission, function(req) {
      if (req.user) {
        var user = new User(req.user.toJSON());
        if (user.can(permission)) return true;
      }
    });
  });

  // Admins have all privileges
  roles.use(function(req) {
    if (req.user) {
      var user = new User(req.user.toJSON());
      if (user.is('admin')) return true;
    }
  });

  // Allow all for adminParty
  roles.use(function(req) {
    if (config.adminParty) return true;
  });

  return roles;
};
