var express = require('express');
var Source = require('../../models/source');
var _ = require('underscore');

module.exports = function(app) {
  app = app || express();

  // Create a new Source
  app.post('/api/source', function(req, res) {
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
    }).on('end', function() {
      Source.create(JSON.parse(data), function(err, source) {
        if (err) res.send(err.status, err.message);
        else res.send(200, source);
      });
    });
  });

  // Get a list of all Sources
  app.get('/api/source', function(req, res) {
    // Find all, exclude `events` field
    Source.find({}, '-events', function(err, sources) {
      if (err) res.send(err.status, err.message);
      else res.send(200, sources);
    });
  });

  // Get a Source by _id
  app.get('/api/source/:_id', function(req, res) {
    Source.findByIdWithLatestEvents(req.params._id, function(err, source) {
      if (err) res.send(err.status, err.message);
      else if (!source) res.send(404);
      else res.send(200, source);
    });
  });

  // Update a Source
  app.put('/api/source/:_id', function(req, res, next) {
    if (req.params._id === '_events') return next();
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
    }).on('end', function() {
      data = JSON.parse(data);
      // Find source to update
      Source.findById(req.params._id, function(err, source) {
        if (err) return res.send(err.status, err.message);
        if (!source) return res.send(404);
        // Update the actual values
        _.each(_.omit(data, ['_id', 'events']), function(val, key) {
          source[key] = val;
        });
        // Save source
        source.save(function(err, numberAffected) {
          if (err) res.send(err.status, err.message);
          else if (!numberAffected) res.send(404);
          else res.send(200);
        });
      });
    });
  });

  // Reset unread error count
  app.put('/api/source/_events/:_id', function(req, res) {
    Source.resetUnreadErrorCount(req.params._id, function(err, source, numberAffected) {
      if (err) res.send(err.status, err.message);
      else if (!source) res.send(404);
      else res.send(200, source);
    });
  });

  // Delete a Source
  app.delete('/api/source/:_id', function(req, res, next) {
    if (req.params._id === '_all') return next();
    Source.findById(req.params._id, function(err, source) {
      if (err) return res.send(err.status, err.message);
      if (!source) return res.send(404);
      source.remove(function(err) {
        if (err) return res.send(err.status, err.message);
        res.send(200);
      });
    });
  });

  // Delete all Sources
  app.delete('/api/source/_all', function(req, res) {
    Source.find(function(err, sources) {
      if (err) return res.send(err.status, err.message);
      if (sources.length === 0) return res.send(200);
      var remaining = sources.length;
      sources.forEach(function(source) {
        source.remove(function(err) {
          if (err) return res.send(err.status, err.message);
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  return app;
};
