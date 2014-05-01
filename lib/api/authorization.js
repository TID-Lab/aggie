var ConnectRoles = require('connect-roles');
var express = require('express');

module.exports = function(app, auth) {
  app = app || express();
  if (!auth) app.use(require('./authentication'));

  var user = new ConnectRoles({
    // Function to customize code that runs when user fails authorization
    failureHandler: function(req, res, action) {
      var error = new Error.AccessDenied('You do not have permission to ' + action);
      res.send(error.status, error.message);
    }
  });

  app.use(user.middleware());

  return require('./permissions')(app, user);
};
