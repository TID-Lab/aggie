var express = require('express');
var User = require('../../../models/user');
var mailer = require('../../mailer');
var _ = require('underscore');

module.exports = function(app) {
  app = app || express();
  app.use(express.bodyParser());

  // Create a new User
  app.post('/api/' + API_VERSION + '/user', function(req, res) {
    User.create(req.body, function(err, user) {
      err = Error.decode(err);
      if (err) res.send(err.status, err.message);
      else {
        // Send email
        mailer.sendFromTemplate({template: 'newUser', user: user}, function(err) {
          if (err) res.send(err.status, err.message);
          else res.send(200, user);
        });
      }
    });
  });

  // Get a list of all Users
  app.get('/api/' + API_VERSION + '/user', function(req, res) {
    User.find({}, '-password', function(err, users) {
      if (err) res.send(err.status, err.message);
      else if (users.length === 0) res.send(404);
      else res.send(200, users);
    });
  });

  // Get a User by id
  app.get('/api/' + API_VERSION + '/user/:username', function(req, res) {
    User.findOne({username: req.params.username}, '-password', function(err, user) {
      if (err) res.send(err.status, err.message);
      else if (!user) res.send(404);
      else res.send(200, user);
    });
  });

  // Update a User
  app.put('/api/' + API_VERSION + '/user/:username', function(req, res) {
    User.findOne({username: req.params.username}, function(err, user) {
      if (err) return res.send(err.status, err.message);
      if (!user) return res.send(404);

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
  app.delete('/api/' + API_VERSION + '/user/:username', function(req, res) {
    User.findOne({username: req.params.username}, function(err, user) {
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
