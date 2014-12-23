// Reads permissions from user model and checks against them.
// Allows admins to do all.

var _ = require('underscore');
var express = require('express');
var config = require('../../config/secrets').get();
var User = require('../../shared/user');

module.exports = function(app, roles) {
  app = app || express();

  // Create access rules for each of the permissions
  _.each(_.keys(User.permissions), function(permission) {
    roles.use(permission, function(req) {
      if (req.user) {
        var user = new User(req.user);
        if (user.can(permission)) return true;
      }
    });
  });

  // Admins have all privileges
  roles.use(function(req) {
    if (req.user) {
      var user = new User(req.user);
      if (user.is('admin')) return true;
    }
  });

  // Allow all for adminParty
  roles.use(function(req) {
    if (config.adminParty) return true;
  });

  return roles;
};
