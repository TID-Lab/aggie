// Handles CRUD requests for credentials
'use strict';

const express = require('express');
const Credentials = require('../../models/credentials');
const Source = require('../../models/source');

// Strips a Credentials document of its credentials
function strip(document) {
  document.credentials = undefined;
}

module.exports = function(app, user) {
  app = app || express();
  user = user || require('../authorization')(app);

  // Create new credentials
  app.post('/api/credentials', user.can('change settings'), async function (req, res) {
    try {
        const credentials = await Credentials.create(req.body);
        credentials.stripSecrets();
        res.send(200, credentials);
    } catch (err) {
        res.send(err.status, err.message);
    }
  });

  // Delete credentials by their ID
  app.delete('/api/credentials/:_id', user.can('change settings'), async function (req, res) {
    const { _id } = req.params;
    try {
      // return 409 Conflict if Sources using these credentials are still left
      const sources = await Source.find({ credentials: _id }).exec();
      if (sources.length > 0) {
        res.send(409);
        return;
      }

      const { deletedCount } = await Credentials.deleteOne({ _id });
      if (deletedCount === 0) return res.send(404);
      res.send(200);
    } catch (err) {
        res.send(err.status, err.message);
    }
  });

  // Get all of the (stripped) credentials
  app.get('/api/credentials', user.can('change settings'), async function (req, res) {
    try {
        const credentials = await Credentials.find({}).exec();
        credentials.forEach((c) => c.stripSecrets());
        res.send(200, credentials);
    } catch (err) {
        res.send(err.status, err.message);
    }
  });

  // Get a set of (stripped) credentials by its ID
  app.get('/api/credentials/:_id', user.can('change settings'), async function (req, res) {
    const { _id } = req.params;
    try {
        const credentials = await Credentials.findById(_id).exec();
        if (!credentials) {
          res.send(404);
          return;
        }
        credentials.stripSecrets();
        res.send(200, credentials);
    } catch (err) {
        res.send(err.status, err.message);
    }
  });

  return app;
};
