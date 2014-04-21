var express = require('express');
var app = express();
var User = require('../../models/user');

// Create a new User
app.post('/api/user', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    User.create(JSON.parse(data), function(err, user) {
      if (err) res.send(err.status, err.message);
      else res.send(200, user);
    });
  });
});

// Get a list of all Users
app.get('/api/user', function(req, res) {
  User.find(function(err, users) {
    if (err) res.send(err.status, err.message);
    else if (users.length === 0) res.send(404);
    else res.send(200, users);
  });
});

// Get a User by id
app.get('/api/user/:id', function(req, res) {
  User.findOne({id: req.params.id}, function(err, user) {
    if (err) res.send(err.status, err.message);
    else if (!user) res.send(404);
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
      if (err) return res.send(err.status, err.message);
      if (!user) return res.send(404);

      for (var attr in data) {
        user[attr] = data[attr];
      }
      user.save(function(err) {
        if (err) res.send(err.status, err.message);
        else res.send(200, user);
      });
    });
  });
});

// Delete a User
app.delete('/api/user/:id', function(req, res) {
  User.findOne({id: req.params.id}, function(err, user) {
    if (err) return res.send(err.status, err.message);
    if (!user) return res.send(404);

    user.remove(function(err) {
      if (err) res.send(err.status, err.message);
      else res.send(200);
    });
  });
});

module.exports = app;
