var express = require('express');
var Incident = require('../../../models/incident');
var _ = require('underscore');

module.exports = function(app, user) {
  app = app || express();
  user = user || require('../authorization')(app);

  app.use(express.bodyParser());

  // Create a new Incident
  app.post('/api/v1/incident', user.can('edit incidents'), function(req, res) {
    Incident.create(req.body, function(err, incident) {
      if (err) res.send(err.status, err.message);
      else res.send(200, incident);
    });
  });

  // Get a list of all Incidents
  app.get('/api/v1/incident', user.can('view data'), function(req, res) {
    // Read query string parameters
    var incident_data = parseQueryData(req.query);
    // Use paginated find
    Incident.findPage(incident_data, req.query.page, function(err, incidents) {
      if (err) res.send(err.status, err.message);
      else res.send(200, incidents);
    });
  });

  // Get an Incident by _id
  app.get('/api/v1/incident/:_id', user.can('view data'), function(req, res) {
    Incident.findById(req.params._id, function(err, incident) {
      if (err) res.send(err.status, err.message);
      else if (!incident) res.send(404);
      else res.send(200, incident);
    });
  });

  // Update an Incident
  app.put('/api/v1/incident/:_id', user.can('edit incidents'), function(req, res, next) {
    // Find incident to update
    Incident.findById(req.params._id, function(err, incident) {
      if (err) return res.send(err.status, err.message);
      if (!incident) return res.send(404);
      // Update the actual values
      incident = _.extend(incident, req.body);
      // Save incident
      incident.save(function(err, numberAffected) {
        if (err) res.send(err.status, err.message);
        else if (!numberAffected) res.send(404);
        else res.send(200);
      });
    });
  });

  // Delete an Incident
  app.delete('/api/v1/incident/:_id', user.can('edit incidents'), function(req, res, next) {
    if (req.params._id === '_all') return next();
    Incident.findById(req.params._id, function(err, incident) {
      if (err) return res.send(err.status, err.message);
      if (!incident) return res.send(404);
      incident.remove(function(err) {
        if (err) return res.send(err.status, err.message);
        res.send(200);
      });
    });
  });

  // Delete all Incidents
  app.delete('/api/v1/incident/_all', user.can('delete data'), function(req, res) {
    Incident.find(function(err, incidents) {
      if (err) return res.send(err.status, err.message);
      if (incidents.length === 0) return res.send(200);
      var remaining = incidents.length;
      incidents.forEach(function(incident) {
        // Delete each incident explicitly to catch it in model
        incident.remove(function(err) {
          if (err) return res.send(err.status, err.message);
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  return app;
};

function parseQueryData(queryString) {
  if (!queryString) return {};
  return _.pick(queryString, ['updatedAt', 'assignedTo', 'status', 'verified']);
};
