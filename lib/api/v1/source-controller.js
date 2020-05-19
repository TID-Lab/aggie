// Handles CRUD requests for sources.
'use strict';

var express = require('express');
var Source = require('../../../models/source');
var _ = require('underscore');
var writelog = require('../../writeLog');
var bodyParser = require('body-parser');

module.exports = function(app, user) {
  app = app || express();
  user = user || require('../authorization')(app);

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(express.json());

  // Create a new Source
  app.post('/api/v1/source', user.can('edit data'), function(req, res) {
    // set user as the logged in user
    if (req.user) req.body.user = req.user._id;

    Source.create(req.body, function(err, source) {
      if (err) {
        return res.status(err.status).send(err.message);
      }
      writelog.writeSource(req, source, 'createSource');
      res.status(200).send(source);
    });
  });

  // Get a list of all Sources
  app.get('/api/v1/source', user.can('view data'), function(req, res) {
    // Find all, exclude `events` field, populate user
    Source.find({}, '-events', { sort: 'nickname' })
            .populate({ path: 'user', select: 'username' })
            .exec(function(err, sources) {
              if (err) res.status(err.status).send(err.message);
              else res.status(200).send(sources);
            });
  });

  // Get a Source by _id
  app.get('/api/v1/source/:_id', user.can('view data'), function(req, res) {
    Source.findByIdWithLatestEvents(req.params._id, function(err, source) {
      if (err) return res.status(err.status).send(err.message);
      else if (!source) return res.sendStatus(404);
      Source.populate(source, [{ path: 'user', select: 'username' }], function(err, source) {
        if (err) res.status(err.status).send(err.message);
        else res.status(200).send(source);
      });
    });
  });

  // Update a Source
  app.put('/api/v1/source/:_id', user.can('edit data'), function(req, res, next) {
    if (req.params._id === '_events') return next();
    // Find source to update
    Source.findById(req.params._id, function(err, source) {
      if (err) return res.status(err.status).send(err.message);
      if (!source) return res.sendStatus(404);

      // Update the actual values
      _.each(_.omit(req.body, ['_id', 'user', 'events']), function(val, key) {
        source[key] = val;
      });
      // Save source
      source.save(function(err, numberAffected) {
        if (err) res.status(err.status).send(err.message);
        else if (!numberAffected) res.sendStatus(404);
        else {
          writelog.writeSource(req, source, 'enable/disable/editSource');
          res.sendStatus(200);
        }
      });
    });
  });

  // Reset unread error count
  app.put('/api/v1/source/_events/:_id', user.can('edit data'), function(req, res) {
    Source.resetUnreadErrorCount(req.params._id, function(err, source) {
      if (err) return res.status(err.status).send(err.message);
      else if (!source) return res.sendStatus(404);
      res.status(200).send(source);
    });
  });

  // Delete a Source
  app.delete('/api/v1/source/:_id', user.can('edit data'), function(req, res, next) {
    if (req.params._id === '_all') return next();
    Source.findById(req.params._id, function(err, source) {
      if (err) return res.status(err.status).send(err.message);
      if (!source) return res.sendStatus(404);
      source.remove(function(err) {
        if (err) return res.status(err.status).send(err.message);
        writelog.writeSource(req, source, 'deleteSource');
        res.sendStatus(200);
      });
    });
  });

  // Delete all Sources
  app.delete('/api/v1/source/_all', user.can('delete data'), function(req, res) {
    Source.find(function(err, sources) {
      if (err) return res.status(err.status).send(err.message);
      if (sources.length === 0) return res.sendStatus(200);
      var remaining = sources.length;
      sources.forEach(function(source) {
        // Delete each source explicitly to catch it in model
        source.remove(function(err) {
          if (err) return res.status(err.status).send(err.message);
          writelog.writeSource(req, source, 'deleteSource');
          if (--remaining === 0) return res.sendStatus(200);
        });
      });
    });
  });

  return app;
};
