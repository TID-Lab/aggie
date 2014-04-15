var express = require('express');
var app = express();
var User = require('../../models/user');

app.use(express.bodyParser());

// Create a new User
app.post('/api/user', function(req, res) {
  User.create(req.body, function(err, user) {
    if (err) res.send(500, err);
    else res.send(200, user);
  });
});

// Get a list of all Users
app.get('/api/user', function(req, res) {
  User.find({}, '-password', function(err, users) {
    if (err) res.send(500, err);
    else if (users.length === 0) res.send(404);
    else res.send(200, users);
  });
});

// Get a User by id
app.get('/api/user/:username', function(req, res) {
  User.findOne({username: req.params.username}, '-password', function(err, user) {
    if (err) res.send(500, err);
    else if (!user) res.send(404);
    else res.send(200, user);
  });
});

// Update a User
app.put('/api/user/:username', function(req, res) {
  User.findOne({username: req.params.username}, function(err, user) {
    if (err) return res.send(500, err);
    if (!user) return res.send(404);

    for (var attr in req.body) {
      user[attr] = req.body[attr];
    }
    user.save(function(err) {
      if (err) res.send(500, err);
      else res.send(200, user);
    });
  });
});

// Delete a User
app.delete('/api/user/:username', function(req, res) {
  User.findOne({username: req.params.username}, function(err, user) {
    if (err) return res.send(500, err);
    if (!user) return res.send(404);

    user.remove(function(err) {
      if (err) res.send(500, err);
      else res.send(200);
    });
  });
});

module.exports = app;
