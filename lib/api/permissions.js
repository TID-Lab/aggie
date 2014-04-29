var _ = require('underscore');
var config = require('../../config/secrets');

module.exports = function(user) {

  // Viewers can only view data
  user.use('view data', function(req) {
    if (verifyRoles(req.user, ['viewer', 'monitor', 'manager', 'admin'])) return true;
  });

  // Monitors can edit incidents and reports
  user.use('edit incidents', function(req) {
    if (verifyRoles(req.user, ['monitor', 'manager', 'admin'])) return true;
  });
  user.use('edit reports', function(req) {
    if (verifyRoles(req.user, ['monitor', 'manager', 'admin'])) return true;
  });

  // Managers can edit sources, enable/disable fetching, and manage trends
  user.use('edit sources', function(req) {
    if (verifyRoles(req.user, ['manager', 'admin'])) return true;
  });
  user.use('toggle fetching', function(req) {
    if (verifyRoles(req.user, ['manager', 'admin'])) return true;
  });
  user.use('manage trends', function(req) {
    if (verifyRoles(req.user, ['manager', 'admin'])) return true;
  });

  // Admins have all privileges
  user.use(function(req) {
    if (verifyRoles(req.user, ['admin'])) return true;
  });

  function verifyRoles(user, roles) {
    if (config.adminParty) return true;
    if (user) return _.contains(roles, user.role);
  }

  return user;
};
