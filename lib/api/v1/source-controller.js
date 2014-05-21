var express = require('express');
var Source = require('../../../models/source');
var _ = require('underscore');

module.exports = function(app, user) {
  app = app || express();
  user = user || require('../authorization')(app);

  app.use(express.urlencoded());
  app.use(express.json());

  // Create a new Source
  app.post('/api/v1/source', user.can('edit sources'), function(req, res) {
    Source.create(req.body, function(err, source) {
      if (err) res.send(err.status, err.message);
      else res.send(200, source);
    });
  });

  // Get a list of all Sources
  app.get('/api/v1/source', user.can('view data'), function(req, res) {
    // Find all, exclude `events` field
    Source.find({}, '-events', function(err, sources) {
      if (err) res.send(err.status, err.message);
      else res.send(200, sources);
    });
  });

  // Get a Source by _id
  app.get('/api/v1/source/:_id', user.can('view data'), function(req, res) {
    Source.findByIdWithLatestEvents(req.params._id, function(err, source) {
      if (err) res.send(err.status, err.message);
      else if (!source) res.send(404);
      else res.send(200, source);
    });
  });

  // Update a Source
  app.put('/api/v1/source/:_id', user.can('edit sources'), function(req, res, next) {
    if (req.params._id === '_events') return next();
    // Find source to update
    Source.findById(req.params._id, function(err, source) {
      if (err) return res.send(err.status, err.message);
      if (!source) return res.send(404);
      // Update the actual values
      _.each(_.omit(req.body, ['_id', 'events']), function(val, key) {
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

  // Reset unread error count
  app.put('/api/v1/source/_events/:_id', user.can('edit sources'), function(req, res) {
    Source.resetUnreadErrorCount(req.params._id, function(err, source, numberAffected) {
      if (err) res.send(err.status, err.message);
      else if (!source) res.send(404);
      else res.send(200, source);
    });
  });

  // Delete a Source
  app.delete('/api/v1/source/:_id', user.can('edit sources'), function(req, res, next) {
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
  app.delete('/api/v1/source/_all', user.can('delete data'), function(req, res) {
    Source.find(function(err, sources) {
      if (err) return res.send(err.status, err.message);
      if (sources.length === 0) return res.send(200);
      var remaining = sources.length;
      sources.forEach(function(source) {
        // Delete each source explicitly to catch it in model
        source.remove(function(err) {
          if (err) return res.send(err.status, err.message);
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  return app;
};
