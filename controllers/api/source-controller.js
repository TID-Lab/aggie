var api = require('../api');
var Source = require('../../models/source');

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

// Create a new Source
api.post('/api/source', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    Source.create(JSON.parse(data), function(err, source) {
      if (err) return res.send(500, err);

      res.send(200, source);
      emitter.emit('source:create', source);
    });
  });
});

// Get a list of all Sources
api.get('/api/source', function(req, res) {
  Source.find(function(err, sources) {
    if (sources.length === 0) res.send(404);
    else if (err) res.send(500, err);
    else res.send(200, sources);
  });
});

// Get a Source by _id
api.get('/api/source/:_id', function(req, res) {
  Source.findOne({_id: req.params._id}, function(err, source) {
    if (!source) res.send(404);
    else if (err) res.send(500, err);
    else res.send(200, source);
  });
});

// Update a Source
api.put('/api/source/:_id', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  }).on('end', function() {
    data = JSON.parse(data);

    Source.findOne({_id: req.params._id}, function(err, source) {
      if (err) return res.send(404, err);

      for (var attr in data) {
        source[attr] = data[attr];
      }
      source.save(function(err) {
        if (err) return res.send(500, err);

        res.send(200, source);
        emitter.emit('source:update', source);
      });
    });

  });
});

// Delete a Source
api.delete('/api/source/:_id', function(req, res) {
  Source.findOne({_id: req.params._id}, function(err, source) {
    if (err || !source) return res.send(404, err);

    source.remove(function(err) {
      if (err) return res.send(500, err);

      res.send(200);
      emitter.emit('source:delete', source);
    });
  });
});

module.exports = api;
