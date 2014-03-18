var Source = require('../../models/source');

var express = require('express');
var app = express();

var config = require('../../config/secrets').mongodb;
var mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.host + '/' + config.db);

module.exports = app;

app.post('/api/source', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    Source.create(JSON.parse(data), function(err, source) {
      if (err) res.send(500, err);
      else res.send(200, source);
    });
  });
});

app.get('/api/source', function(req, res) {
  Source.find(function(err, sources) {
    if (err) res.send(500, err);
    else res.send(200, sources);
  });
});

app.get('/api/source/:id', function(req, res) {
  Source.findOne({id: req.params.id}, function(err, source) {
    if (err) res.send(404, err);
    else res.send(200, source);
  });
});

app.put('/api/source/:id', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    data = JSON.parse(data);
    Source.findOne({id: req.params.id}, function(err, source) {
      if (err) res.send(404, err);
      else {
        for (var attr in data) {
          source[attr] = data[attr];
        }
        source.save(function(err) {
          if (err) res.send(500, err);
          else res.send(200, source);
        });
      }
    });
  });
});

app.delete('/api/source/:id', function(req, res) {
  Source.findOne({id: req.params.id}, function(err, source) {
    if (err || !source) res.send(404, err);
    else source.remove(function(err) {
      if (err) res.send(500, err);
      else res.send(200);
    });
  });
});
