var express = require('express');
var app = express();
var User = require('../../models/user');
var error = require('../error');

// Create a new User
app.post('/api/user', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    User.create(JSON.parse(data), function(err, user) {
      if (err) error.send(res, err);
      else res.send(200, user);
    });
  });
});

// Get a list of all Users
app.get('/api/user', function(req, res) {
  User.find(function(err, users) {
    if (err) error.send(res, err);
    else if (users.length === 0) error.send(res, 404);
    else res.send(200, users);
  });
});

// Get a User by id
app.get('/api/user/:id', function(req, res) {
  User.findOne({id: req.params.id}, function(err, user) {
    if (err) error.send(res, err);
    else if (!user) error.send(res, 404);
    else res.send(200, user);
  });
});

// Update a User
app.put('/api/user/:id', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    data = JSON.parse(data);

    User.findOne({id: req.params.id}, function(err, user) {
      if (err) return error.send(res, err);
      if (!user) return error.send(res, 404);

      for (var attr in data) {
        user[attr] = data[attr];
      }
      user.save(function(err) {
        if (err) error.send(res, err);
        else res.send(200, user);
      });
    });
  });
});

// Delete a User
app.delete('/api/user/:id', function(req, res) {
  User.findOne({id: req.params.id}, function(err, user) {
    if (err) return error.send(res, err);
    if (!user) return error.send(res, 404);

    user.remove(function(err) {
      if (err) error.send(res, err);
      else res.send(200);
    });
  });
});

module.exports = app;
