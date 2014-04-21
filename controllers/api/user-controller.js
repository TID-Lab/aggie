var express = require('express');
var User = require('../../models/user');
var mailer = require('../mailer');
var _ = require('underscore');

module.exports = function(app) {
  app = app || express();
  app.use(express.bodyParser());

  // Create a new User
  app.post('/api/user', function(req, res) {
    User.create(req.body, function(err, user) {
      if (err) return parseError(res, err);
      else {
        // Send email
        mailer.sendFromTemplate({template: 'newUser', user: user}, function(err) {
          if (err) return parseError(res, err);
          res.send(200, user);
        });
      }
    });
  });

  // Get a list of all Users
  app.get('/api/user', function(req, res) {
    User.find({}, '-password', function(err, users) {
      if (err) parseError(res, err);
      else if (users.length === 0) res.send(404);
      else res.send(200, users);
    });
  });

  // Get a User by id
  app.get('/api/user/:username', function(req, res) {
    User.findOne({username: req.params.username}, '-password', function(err, user) {
      if (err) parseError(res, err);
      else if (!user) res.send(404);
      else res.send(200, user);
    });
  });

  // Update a User
  app.put('/api/user/:username', function(req, res) {
    User.findOne({username: req.params.username}, function(err, user) {
      if (err) return parseError(res, err);
      if (!user) return res.send(404);

      for (var attr in req.body) {
        user[attr] = req.body[attr];
      }
      user.save(function(err) {
        if (err) parseError(res, err);
        else res.send(200, user);
      });
    });
  });

  // Delete a User
  app.delete('/api/user/:username', function(req, res) {
    User.findOne({username: req.params.username}, function(err, user) {
      if (err) return parseError(res, err);
      if (!user) return res.send(404);

      user.remove(function(err) {
        if (err) parseError(res, err);
        else res.send(200);
      });
    });
  });

  // Determine error status and messages
  function parseError(res, err) {
    if (err.errors) {
      var errors = [];
      _.each(err.errors, function(error) {
        switch (error.type) {
          case 'required':
            errors.push(error.path + '_' + error.type);
            break;
          default:
            errors.push(error.message);
            break;
        }
      });
      res.send(422, errors.length === 1 ? errors[0] : errors);
    } else if (err.err) {
      switch (err.code) {
        case 11000:
          res.send(422, err.err.replace(/(.*)\$(.*)\_(.*)/, '$2') + '_not_unique');
      }
    } else {
      res.send(err.status || 500, err.message);
    }
  };

  return app;
};
