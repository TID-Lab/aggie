var express = require('express');
var app = express();
var Source = require('../../models/source');

// Create a new Source
app.post('/api/source', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    Source.create(JSON.parse(data), function(err, source) {
      if (err) return res.send(500, err);
      res.send(200, source);
    });
  });
});

// Get a list of all Sources
app.get('/api/source', function(req, res) {
  Source.find(function(err, sources) {
    if (err) res.send(500, err);
    else res.send(200, sources);
  });
});

// Get a Source by _id
app.get('/api/source/:_id', function(req, res) {
  Source.findOne({_id: req.params._id}, function(err, source) {
    if (err) res.send(500, err);
    else if (!source) res.send(404);
    else res.send(200, source);
  });
});

// Update a Source
app.put('/api/source/:_id', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    data = JSON.parse(data);

    Source.findOne({_id: req.params._id}, function(err, source) {
      if (err) return res.send(500, err);
      else if (!source) return res.send(404);

      for (var attr in data) {
        source[attr] = data[attr];
      }
      source.save(function(err) {
        if (err) return res.send(500, err);
        res.send(200, source);
      });
    });

  });
});

// Delete a Source
app.delete('/api/source/:_id', function(req, res, next) {
  if (req.params._id === '_all') return next();
  Source.findOne({_id: req.params._id}, function(err, source) {
    if (err) return res.send(500, err);
    if (!source) return res.send(404);

    source.remove(function(err) {
      if (err) return res.send(500, err);
      res.send(200);
    });
  });
});

// Delete all Sources
app.delete('/api/source/_all', function(req, res) {
  Source.find(function(err, sources) {
    if (err) return res.send(500, err);
    if (sources.length === 0) return res.send(200);
    var remaining = sources.length;
    sources.forEach(function(source) {
      source.remove(function(err) {
        if (err) return res.send(500, err);
        if (--remaining === 0) return res.send(200);
      });
    });
  });
});

module.exports = app;
