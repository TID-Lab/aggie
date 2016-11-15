// Handles CRUD requests for incidents.

var express = require('express');
var Incident = require('../../../models/incident');
var _ = require('lodash');
var logger = require('../../logger');

module.exports = function(app, user) {
  app = app || express();
  user = user || require('../authorization')(app);

  app.use(express.urlencoded());
  app.use(express.json());

  // Create a new Incident
  app.post('/api/v1/incident', user.can('edit incidents'), function(req, res) {
    req.body.creator = req.user;
    Incident.create(req.body, function(err, incident) {
      if (err) {
        res.send(err.status, err.message);
      } else {
        var logDetails = {
          userID: req.user._id,
          username: req.user.username,
          action: 'create',
          actionRef: {
            incidentTitle: incident.title,
            incidentID: incident._id
          }
        };
        logger.logActivity(logDetails);
        res.send(200, incident);
      }
    });
  });

  // Get a list of all Incidents
  app.get('/api/v1/incident', user.can('view data'), function(req, res) {
    // Read query string parameters
    var incidentData = parseQueryData(req.query);
    // Use paginated find
    Incident.queryIncidents(incidentData, req.query.page,
      { sort: '-updatedAt', populate: [{ path: 'creator', select: 'username' }, { path: 'assignedTo', select: 'username' }] }, function(err, incidents) {
        if (err) res.send(err.status, err.message);
        else res.send(200, incidents);
      });
  });

  // Get an Incident by _id
  app.get('/api/v1/incident/:_id', user.can('view data'), function(req, res) {
    Incident
      .findById(req.params._id)
      .populate({ path: 'creator', select: 'username' })
      .populate({ path: 'assignedTo', select: 'username' })
      .exec(function(err, incident) {
        if (err) res.send(err.status, err.message);
        else if (!incident) res.send(404);
        else {
          var logDetails = {
            userID: req.user._id,
            username: req.user.username,
            action: 'view',
            actionRef: {
              incidentTitle: incident.title,
              incidentID: incident._id
            }
          };
          logger.logActivity(logDetails);
          res.send(200, incident);
        }
      }
    );
  });

  // Update an Incident
  app.put('/api/v1/incident/:_id', user.can('edit data'), function(req, res, next) {
    // Find incident to update
    Incident.findById(req.params._id, function(err, incident) {
      if (err) return res.send(err.status, err.message);
      if (!incident) return res.send(404);
      // Update the actual values
      incident = _.extend(incident, _.omit(req.body, 'creator'));

      // Save incident
      incident.save(function(err, numberAffected) {
        if (err) {
          res.send(err.status, err.message);
        } else if (!numberAffected) {
          res.send(404);
        } else {
          var logDetails = {
            userID: req.user._id,
            username: req.user.username,
            action: 'edit',
            actionRef: {
              incidentTitle: incident.title,
              incidentID: incident._id
            }
          };
          logger.logActivity(logDetails);
          res.send(200);
        }
      });
    });
  });


  // Delete selected Incidents
  app.post('/api/v1/incident/_selected', user.can('edit data'), function(req, res) {
    if (!req.body.ids || !req.body.ids.length) return res.send(200);

    Incident.find({ '_id': { $in: req.body.ids } }, function(err, incidents) {
      if (err) return res.send(err.status, err.message);
      if (incidents.length === 0) return res.send(200);
      var remaining = incidents.length;
      incidents.forEach(function(incident) {
        // Delete each incident explicitly to catch it in model
        incident.remove(function(err) {
          if (err) return res.send(err.status, err.message);
          var logDetails = {
            userID: req.user._id,
            username: req.user.username,
            action: 'delete',
            actionRef: {
              incidentTitle: incident.title,
              incidentID: incident._id
            }
          };
          logger.logActivity(logDetails);
          if (--remaining === 0) {
            return res.send(200);
          }
        });
      });
    });
  });

  // Delete an Incident
  app.delete('/api/v1/incident/:_id', user.can('edit data'), function(req, res, next) {
    if (req.params._id === '_all') return next();
    Incident.findById(req.params._id, function(err, incident) {
      if (err) return res.send(err.status, err.message);
      if (!incident) return res.send(404);
      incident.remove(function(err) {
        if (err) {
          return res.send(err.status, err.message);
        }
        var logDetails = {
          userID: req.user._id,
          username: req.user.username,
          action: 'delete',
          actionRef: {
            incidentTitle: incident.title,
            incidentID: incident._id
          }
        };
        logger.logActivity(logDetails);
        res.send(200);
      });
    });
  });

  // Delete all Incidents
  app.delete('/api/v1/incident/_all', user.can('edit data'), function(req, res) {
    Incident.find(function(err, incidents) {
      if (err) return res.send(err.status, err.message);
      if (incidents.length === 0) return res.send(200);
      var remaining = incidents.length;
      incidents.forEach(function(incident) {
        // Delete each incident explicitly to catch it in model
        incident.remove(function(err) {
          if (err) return res.send(err.status, err.message);
          var logDetails = {
            userID: req.user._id,
            username: req.user.username,
            action: 'delete',
            actionRef: {
              incidentTitle: incident.title,
              incidentID: incident._id
            }
          };
          logger.logActivity(logDetails);
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  return app;
};

function parseQueryData(queryString) {
  if (!queryString) return {};
  var query = _.pick(queryString, Incident.filterAttributes);
  if (query.tags) query.tags = query.tags.split(',').map(_.trim);
  return query;
}
