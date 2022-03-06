// Sets up authorization, using connect roles npm module.
var ConnectRoles = require('connect-roles');

module.exports = function(app, auth) {
  var roles = new ConnectRoles({
    // Function to customize code that runs when user fails authorization
    failureHandler: function(req, res, action) {
      var error = new Error.AccessDenied('You do not have permission to ' + action);
      res.send(error.status, error.message);
    }
  });

  app.use(roles.middleware());

  return require('./permissions')(app, roles);
};
