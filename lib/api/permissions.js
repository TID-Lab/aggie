var _ = require('underscore');
var express = require('express');
var config = require('../../config/secrets');

module.exports = function(app, user) {
  app = app || express();

  user.permissions = {
    'view data': ['viewer', 'monitor', 'manager', 'admin'],
    'edit incidents': ['monitor', 'manager', 'admin'],
    'edit reports': ['monitor', 'manager', 'admin'],
    'edit sources': ['manager', 'admin'],
    'toggle fetching': ['manager', 'admin'],
    'manage trends': ['manager', 'admin']
  };

  // Create access rules for each of the permissions
  _.each(user.permissions, function(roles, permission) {
    user.use(permission, function(req) {
      if (verifyRoles(req.user, roles)) return true;
    });
  });

  // Admins have all privileges
  user.use(function(req) {
    if (verifyRoles(req.user, ['admin'])) return true;
  });

  function verifyRoles(user, roles) {
    if (config.adminParty) return true;
    if (user) return _.contains(roles, user.role);
  }

  // Expose permissions to the client
  app.get('/permissions.json', function(req, res) {
    res.json(200, user.permissions);
  });

  return user;
};
