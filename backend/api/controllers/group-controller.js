// Handles CRUD requests for groups.
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var Group = require('../../models/group');
var _ = require('lodash');
var writelog = require('../../writeLog');
var tags = require('../../shared/tags');

module.exports = function(app, user) {
  app = app || express();
  user = user || require('../authorization')(app);

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  // Create a new Group
  app.post('/api/group', user.can('edit data'), function(req, res) {
    req.body.creator = req.user;
    Group.create(req.body, function(err, group) {
      if (err) {
        res.send(err.status, err.message);
      } else {
        writelog.writeGroup(req, group, 'createGroup');
        res.send(200, group);
      }
    });
  });

  // Get a list of all Groups
  app.get('/api/group', user.can('view data'), function(req, res) {
    // Read query string parameters
    var groupData = parseQueryData(req.query);
    // Use paginated find
    Group.queryGroups(groupData, req.query.page,
      { sort: '-updatedAt', populate: [{ path: 'creator', select: 'username' }, { path: 'assignedTo', select: 'username' }] }, function(err, groups) {
        if (err) res.send(err.status, err.message);
        else res.send(200, groups);
      });
  });

  // Get an Group by _id
  app.get('/api/group/:_id', user.can('view data'), function(req, res) {
    var referer = req.headers.referer || '';
    Group
      .findById(req.params._id)
      .populate({ path: 'creator', select: 'username' })
      .populate({ path: 'assignedTo', select: 'username' })
      .exec(function(err, group) {
        if (err) res.send(err.status, err.message);
        else if (!group) res.send(404);
        else {
          if (!(referer.split('/')[referer.split('/').length - 1] === 'reports')) {
            writelog.writeGroup(req, group, 'viewGroup');
          }
          res.send(200, group);
        }
      }
    );
  });

  // Update an Group
  app.put('/api/group/:_id', user.can('edit data'), function(req, res, next) {
    // Find group to update
    Group.findById(req.params._id, function(err, group) {
      if (err) return res.send(err.status, err.message);
      if (!group) return res.send(404);
      // Update the actual values
      group = _.extend(group, _.omit(req.body, 'creator'));

      // Save group
      group.save(function(err, numberAffected) {
        if (err) {
          res.send(err.status, err.message);
        } else if (!numberAffected) {
          res.send(404);
        } else {
          writelog.writeGroup(req, group, 'editGroup');
          res.send(200);
        }
      });
    });
  });


  // Delete selected Groups
  app.post('/api/group/_selected', user.can('edit data'), function(req, res) {
    if (!req.body.ids || !req.body.ids.length) return res.send(200);
    Group.find({ '_id': { $in: req.body.ids } }, function(err, groups) {
      if (err) return res.send(err.status, err.message);
      if (groups.length === 0) return res.send(200);
      var remaining = groups.length;
      groups.forEach(function(group) {
        // Delete each group explicitly to catch it in model
        group.remove(function(err) {
          if (err) {
            if (!res.headersSent) res.send(err.status, err.message)
            return;
          }
          writelog.writeGroup(req, group, 'deleteGroup');
          if (--remaining === 0) {
            return res.send(200);
          }
        });
      });
    });
  });

  app.patch('/api/group/_tag', user.can('edit data'), function(req, res) {
    if (!req.body.ids || !req.body.ids.length) return res.send(200);
    Group.find({ '_id': { $in: req.body.ids } }, function(err, groups) {
      if (err) return res.send(err.status, err.message);
      if (groups.length === 0) return res.send(200);
      var remaining = groups.length;
      groups.forEach(function(group) {
        group.addSMTCTag(req.body.smtcTag, (err) => {
          if (err && !res.headersSent) {
            res.send(500, err.message);
            return;
          }
          // Save group
          group.save(function(err, numberAffected) {
            if (err) {
              res.send(err.status, err.message);
            } else if (!numberAffected) {
              res.send(404);
            } else {
              writelog.writeGroup(req, group, 'addTagToGroup');
              res.send(200);
            }
          });
        });
      });
    });
  });

  app.patch('/api/group/_untag', user.can('edit data'), function(req, res) {
    if (!req.body.ids || !req.body.ids.length) return res.send(200);
    Group.find({ '_id': { $in: req.body.ids } }, function(err, groups) {
      if (err) return res.send(err.status, err.message);
      if (groups.length === 0) return res.send(200);
      var remaining = groups.length;
      groups.forEach(function(group) {
        group.removeSMTCTag(req.body.smtcTag, (err) => {
          if (err && !res.headersSent) {
            res.send(500, err.message);
            return;
          }
          // Save group
          group.save(function(err, numberAffected) {
            if (err) {
              res.send(err.status, err.message);
            } else if (!numberAffected) {
              res.send(404);
            } else {
              writelog.writeGroup(req, group, 'removeTagFromGroup');
              res.send(200);
            }
          });
        });
      });
    });
  });

  app.patch('/api/group/_clearTags', user.can('edit data'), function(req, res) {
    if (!req.body.ids || !req.body.ids.length) return res.send(200);
    Group.find({ '_id': { $in: req.body.ids } }, function(err, groups) {
      if (err) return res.send(err.status, err.message);
      if (groups.length === 0) return res.send(200);
      var remaining = groups.length;
      groups.forEach(function(group) {
        group.clearSMTCTags(req.body.smtcTag, (err) => {
          if (err && !res.headersSent) {
            res.send(500, err.message);
            return;
          }
          // Save group
          group.save(function(err, numberAffected) {
            if (err) {
              res.send(err.status, err.message);
            } else if (!numberAffected) {
              res.send(404);
            } else {
              writelog.writeGroup(req, group, 'ClearTagsFromGroup');
              res.send(200);
            }
          });
        });
      });
    });
  });

  // Delete an Group
  app.delete('/api/group/:_id', user.can('edit data'), function(req, res, next) {
    if (req.params._id === '_all') return next();
    Group.findById(req.params._id, function(err, group) {
      if (err) return res.send(err.status, err.message);
      if (!group) return res.send(404);
      group.remove(function(err) {
        if (err) {
          return res.send(err.status, err.message);
        }
        writelog.writeGroup(req, group, 'deleteGroup');
        res.send(200);
      });
    });
  });

  // Delete all Groups
  app.delete('/api/group/_all', user.can('edit data'), function(req, res) {
    Group.find(function(err, groups) {
      if (err) return res.send(err.status, err.message);
      if (groups.length === 0) return res.send(200);
      var remaining = groups.length;
      groups.forEach(function(group) {
        // Delete each group explicitly to catch it in model
        group.remove(function(err) {
          if (err) {
            if (!res.headersSent) res.send(err.status, err.message)
            return;
          }
          writelog.writeGroup(req, group, 'deleteGroup');
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  return app;
};

function parseQueryData(queryString) {
  if (!queryString) return {};
  if (queryString.before) queryString.storedAt = { $lte: queryString.before }
  if (queryString.after)  queryString.storedAt = Object.assign({}, queryString.storedAt, { $gte: queryString.after });
  var query = _.pick(queryString, Group.filterAttributes);
  if (query.tags) query.tags = tags.toArray(query.tags);
  return query;
}
