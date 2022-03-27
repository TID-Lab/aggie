// Handles CRUD requests for sources.
'use strict';

var Source = require('../../models/source');
var _ = require('underscore');
var writelog = require('../../writeLog');


// Create a new Source
exports.source_create = (req, res) => {
  // set user as the logged in user
  if (req.user) req.body.user = req.user._id;
  Source.create(req.body, function(err, source) {
    if (err) {
      return res.status(err.status).send(err.message);
    }
    writelog.writeSource(req, source, 'createSource');
    res.send(200, source);
  });
}

// Get a list of all sources
exports.source_sources = (req, res) => {
  // Find all, exclude `events` field, populate user
  Source.find({}, '-events', { sort: 'nickname' })
    .populate([
      { path: 'user', select: 'username' },
      { path: 'credentials' }
    ])
    .exec(function(err, sources) {
      if (err) res.status(err.status).send(err.message);
      else res.status(200).send(sources);
    });
}

exports.source_details = (req, res) => {
  Source.findByIdWithLatestEvents(req.params._id, function(err, source) {
    if (err) return res.status(err.status).send(err.message);
    else if (!source) return res.sendStatus(404);
    Source.populate(
      source,
      [
        { path: 'user', select: 'username' },
        { path: 'credentials' }
      ],
      function(err, source) {
        if (err) res.status(err.status).send(err.message);
        else res.send(200, source);
      });
  });
}

exports.source_update = (req, res, next) => {
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
    });e
  });
}

exports.source_reset_errors = (req, res) => {
  Source.resetUnreadErrorCount(req.params._id, function(err, source) {
    if (err) return res.status(err.status).send(err.message);
    else if (!source) return res.sendStatus(404);
    res.status(200).send(source);
  });
}

// Delete a Source
exports.source_delete = (req, res, next) => {
  if (req.params._id === '_all') return next();
  Source.findById(req.params._id, function(err, source) {
    if (err) return res.status(err.status).send(err.message);
    if (!source) return res.sendStatus(404);
    source.remove((err) => {
      if (err) return res.status(err.status).send(err.message);
      writelog.writeSource(req, source, 'deleteSource');
      res.sendStatus(200);
    });
  });
}

// Delete all Sources
exports.source_delete_all = (req, res) => {
  Source.find(function(err, sources) {
    if (err) return res.status(err.status).send(err.message);
    if (sources.length === 0) return res.sendStatus(200);
    var remaining = sources.length;
    sources.forEach(function(source) {
      // Delete each source explicitly to catch it in model
      source.remove((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeSource(req, source, 'deleteSource');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}

// update sources TODO: This doesn't work I'm just putting a placeholder here.
exports.source_update_all = (req, res) => {
  Source.find(function(err, sources) {
    if (err) return res.status(err.status).send(err.message);
    if (sources.length === 0) return res.sendStatus(200);
    var remaining = sources.length;
    sources.forEach(function(source) {
      // Delete each source explicitly to catch it in model
      source.remove((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeSource(req, source, 'deleteSource');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}