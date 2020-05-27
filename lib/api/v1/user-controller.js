// Handles CRUD requests for users.

var express = require('express');
var User = require('../../../models/user');
var UserPermissions = require('../../../shared/user');
var mailer = require('../../mailer');
var _ = require('underscore');

module.exports = function(app, user) {
  app = app || express();
  var auth = require('../authentication')(app);
  var password = require('../reset-password')(app, auth);
  user = user || require('../authorization')(app);

  function sendEmail(user, req, callback) {
    // Only send email if not in test mode.
    if (process.env.NODE_ENV == 'test')
      callback(null);
    else {
      var token = password.encodeToken(user);
      mailer.sendFromTemplate({
        template: 'newUser',
        user: user,
        token: token,
        host: req.headers.host,
        protocol: req.protocol,
        acceptLanguage: req.headers['accept-language']
      }, function(err) {
        if (err) callback(err);
        else callback(null);
      });
    }
  }

  app.use(express.urlencoded());
  app.use(express.json());

  // Get a list of all Users
  app.get('/api/v1/user', user.can('view users'), function(req, res) {
    var query = {};
    if (req.user && !(new UserPermissions(req.user)).can('view other users'))
      query.username = req.user.username;

    User.find(query, '-password', function(err, users) {
      if (err) res.send(err.status, err.message);
      else res.send(200, users);
    });
  });

  // Get a User by id
  app.get('/api/v1/user/:_id', user.can('admin users'), function(req, res) {
    User.findById(req.params._id, '-password', function(err, user) {
      if (err) res.send(err.status, err.message);
      else if (!user) res.send(404);
      else res.send(200, user);
    });
  });

  // Create a new User
  app.post('/api/v1/user', user.can('admin users'), function(req, res) {
    User.create(req.body, function(err, user) {
      err = Error.decode(err);
      if (err) res.send(err.status, err.message);
      else {
        // Send password reset email
        sendEmail(user, req, function(err) {
          if (err) res.send(err.status, err.message);
          else res.send(200, user);
        });
      }
    });
  });

  // Update a User
  app.put('/api/v1/user/:_id', user.can('update users'), function(req, res) {
    User.findById(req.params._id, function(err, user) {
      if (err) return res.send(err.status, err.message);
      if (!user) return res.send(404);
      // Only admin can update users other than itself
      if (req.user && !(new UserPermissions(req.user)).can('admin users') && req.params._id != req.user._id) return res.send(403);

      for (var attr in req.body) {
        user[attr] = req.body[attr];
      }
      user.save(function(err) {
        err = Error.decode(err);
        if (err) res.send(err.status, err.message);
        else res.send(200, user);
      });
    });
  });

  // Delete a User
  app.delete('/api/v1/user/:_id', user.can('admin users'), function(req, res) {
    User.findById(req.params._id, function(err, user) {
      if (err) return res.send(err.status, err.message);
      if (!user) return res.send(404);

      user.remove(function(err) {
        err = Error.decode(err);
        if (err) res.send(err.status, err.message);
        else res.send(200);
      });
    });
  });

  return app;
};
