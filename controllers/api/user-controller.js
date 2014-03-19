var api = require('../api');
var User = require('../../models/user');

api.post('/api/user', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    User.create(JSON.parse(data), function(err, user) {
      if (err) res.send(500, err);
      else res.send(200);
    });
  });
});

api.get('/api/user', function(req, res) {
  User.find(function(err, users) {
    if (err) res.send(500, err);
    else res.send(200, users);
  });
});

api.get('/api/user/:id', function(req, res) {
  User.findOne({id: req.params.id}, function(err, user) {
    if (err) res.send(404, err);
    else res.send(200, user);
  });
});

api.put('/api/user/:id', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    data = JSON.parse(data);
    User.findOne({id: req.params.id}, function(err, user) {
      if (err) res.send(404, err);
      else {
        for (var attr in data) {
          user[attr] = data[attr];
        }
        user.save(function(err) {
          if (err) res.send(500, err);
          else res.send(200, user);
        });
      }
    });
  });
});

api.delete('/api/user/:id', function(req, res) {
  User.findOne({id: req.params.id}, function(err, user) {
    if (err) res.send(404, err);
    else user.remove(function(err) {
      if (err) res.send(500, err);
      else res.send(200);
    });
  });
});

module.exports = api;
