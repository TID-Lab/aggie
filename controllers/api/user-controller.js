var api = require('../api').app;
var User = require('../../models/user');

// Create a new User
api.post('/api/user', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    User.create(JSON.parse(data), function(err, user) {
      if (err) res.send(500, err);
      else res.send(200, user);
    });
  });
});

// Get a list of all Users
api.get('/api/user', function(req, res) {
  User.find(function(err, users) {
    if (err) res.send(500, err);
    else if (users.length === 0) res.send(404);
    else res.send(200, users);
  });
});

// Get a User by id
api.get('/api/user/:id', function(req, res) {
  User.findOne({id: req.params.id}, function(err, user) {
    if (err) res.send(500, err);
    else if (!user) res.send(404);
    else res.send(200, user);
  });
});

// Update a User
api.put('/api/user/:id', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    data = JSON.parse(data);

    User.findOne({id: req.params.id}, function(err, user) {
      if (err) return res.send(500, err);
      if (!user) return res.send(404);

      for (var attr in data) {
        user[attr] = data[attr];
      }
      user.save(function(err) {
        if (err) res.send(500, err);
        else res.send(200, user);
      });
    });
  });
});

// Delete a User
api.delete('/api/user/:id', function(req, res) {
  User.findOne({id: req.params.id}, function(err, user) {
    if (err) return res.send(500, err);
    if (!user) return res.send(404);

    user.remove(function(err) {
      if (err) res.send(500, err);
      else res.send(200);
    });
  });
});

module.exports = api;
