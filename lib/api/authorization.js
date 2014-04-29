var ConnectRoles = require('connect-roles');
var express = require('express');

module.exports = function(app, auth) {
  app = app || express();
  if (!auth) app.use(require('./authentication'));

  var user = new ConnectRoles({
    // Function to customize code that runs when user fails authorization
    failureHandler: function(req, res, action) {
      var accept = req.headers.accept || '';
      res.status(403);
      if (~accept.indexOf('html')) {
        res.render('access-denied', {action: action});
      } else {
        res.send('Access Denied - You don\'t have permission to ' + action);
      }
    }
  });

  app.use(user.middleware());

  return require('./permissions')(user);
};
