// Handles CRUD requests for groups.
'use strict';

var Group = require('../../models/group');
const _ = require('lodash');
var writelog = require('../../writeLog');
var tags = require('../../shared/tags');
const Report = require("../../models/report");

exports.group_create = (req, res) => {
  req.body.creator = req.user;
  Group.create(req.body, (err, group) => {
    if (err) {
      res.status(err.status).send(err.message);
    } else {
      writelog.writeGroup(req, group, 'createGroup');
      res.status(200).send(group);
    }
  });
}

exports.group_all_groups = (req, res) => {
  Group.find({}, (err, groups) => {
    if (err) res.status(err.status).send(err.message);
    else res.status(200).send(groups);
  });
}

exports.group_groups = (req, res) => {
  // Read query string parameters
  var groupData = parseQueryData(req.query);
  // Use paginated find
  Group.queryGroups(groupData, req.query.page,
    { sort: '-updatedAt', populate: [{ path: 'creator', select: 'username' }, { path: 'assignedTo', select: 'username' }] }, function(err, groups) {
      if (err) res.status(err.status).send(err.message);
      else res.status(200).send(groups);
  });
}

exports.group_details = (req, res) => {
  var referer = req.headers.referer || '';
  Group
    .findById(req.params._id)
    .populate({ path: 'creator', select: 'username' })
    .populate({ path: 'assignedTo', select: 'username' })
    .exec((err, group) => {
      if (err) res.status(err.status).send(err.message);
      else if (!group) res.sendStatus(404);
      else {
        if (!(referer.split('/')[referer.split('/').length - 1] === 'reports')) {
          writelog.writeGroup(req, group, 'viewGroup');
        }
        res.status(200).send(group);
      }
    }
  );
}

  // Update a Group
exports.group_update = (req, res, next) => {
  // Find group to update
  Group.findById(req.params._id, (err, group) => {
    if (err) return res.status(err.status).send(err.message);
    if (!group) return res.sendStatus(404);
    // Update the actual values
    group = _.extend(group, _.omit(req.body, 'creator'));

    // Save group
    group.save(function(err, numberAffected) {
      if (err) {
        res.status(err.status).send(err.message);
      } else if (!numberAffected) {
        res.sendStatus(404);
      } else {
        writelog.writeGroup(req, group, 'editGroup');
        res.sendStatus(200);
      }
    });
  });
}

// Delete selected groups
exports.group_selected_delete = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Group.find({ '_id': { $in: req.body.ids } }, function(err, groups) {
    if (err) return res.status(err.status).send(err.message);
    if (groups.length === 0) return res.sendStatus(200);
    var remaining = groups.length;
    groups.forEach(function(group) {
      // Delete each group explicitly to catch it in model
      group.remove((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeGroup(req, group, 'deleteGroup');
        if (--remaining === 0) {
          return res.sendStatus(200);
        }
      });
    });
  });
}

exports.group_tags_add = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Group.find({ '_id': { $in: req.body.ids } }, function(err, groups) {
    if (err) return res.status(err.status).send(err.message);
    if (groups.length === 0) return res.sendStatus(200);
    var remaining = groups.length;
    groups.forEach(function(group) {
      group.addSMTCTag(req.body.smtcTag, (err) => {
        if (err && !res.headersSent) {
          res.status(500).send(err.message);
          return;
        }
        // Save group
        group.save(function(err, numberAffected) {
          if (err) {
            res.status(err.status).send(err.message);
          } else if (!numberAffected) {
            res.sendStatus(404);
          } else {
            writelog.writeGroup(req, group, 'addTagToGroup');
            res.sendStatus(200);
          }
        });
      });
    });
  });
}

exports.group_tags_remove = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Group.find({ '_id': { $in: req.body.ids } }, function(err, groups) {
    if (err) return res.status(err.status).send(err.message);
    if (groups.length === 0) return res.sendStatus(200);
    groups.forEach(function(group) {
      group.removeSMTCTag(req.body.smtcTag, (err) => {
        if (err && !res.headersSent) {
          res.send(500, err.message);
          return;
        }
        // Save group
        group.save(function(err, numberAffected) {
          if (err) {
            res.status(err.status).send(err.message);
          } else if (!numberAffected) {
            res.sendStatus(404);
          } else {
            writelog.writeGroup(req, group, 'removeTagFromGroup');
            res.sendStatus(200);
          }
        });
      });
    });
  });
}

// Escalate selected groups
exports.group_escalated_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Group.find({ _id: { $in: req.body.ids } }, (err, groups) => {
    if (err) return res.status(err.status).send(err.message);
    if (groups.length === 0) return res.sendStatus(200);
    let remaining = groups.length;
    groups.forEach((group) => {
      // Mark each report as escalated to catch it in model
      group.setEscalated(req.body.escalated);
      group.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, group, 'escalatedGroup');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}

// Update group notes
exports.group_closed_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Group.find({ _id: { $in: req.body.ids } }, (err, groups) => {
    if (err) return res.status(err.status).send(err.message);
    if (groups.length === 0) return res.sendStatus(200);
    let remaining = groups.length;
    groups.forEach((group) => {
      // Mark each report as escalated to catch it in model
      group.closed = req.body.closed;
      group.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, group, 'notesGroup');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}

// Update group veracity
exports.group_veracity_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Group.find({ _id: { $in: req.body.ids } }, (err, groups) => {
    if (err) return res.status(err.status).send(err.message);
    if (groups.length === 0) return res.sendStatus(200);
    let remaining = groups.length;
    groups.forEach((group) => {
      // Mark each report as escalated to catch it in model
      group.setVeracity(req.body.veracity);
      group.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, group, 'veracityGroup');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}

// Update group notes
exports.group_notes_update = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Group.find({ _id: { $in: req.body.ids } }, (err, groups) => {
    if (err) return res.status(err.status).send(err.message);
    if (groups.length === 0) return res.sendStatus(200);
    let remaining = groups.length;
    groups.forEach((group) => {
      // Mark each report as escalated to catch it in model
      group.notes = req.body.notes;
      group.save((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeReport(req, group, 'notesGroup');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}

exports.group_tags_clear = (req, res) => {
  if (!req.body.ids || !req.body.ids.length) return res.sendStatus(200);
  Group.find({ '_id': { $in: req.body.ids } }, function(err, groups) {
    if (err) return res.status(err.status).send(err.message);
    if (groups.length === 0) return res.sendStatus(200);
    groups.forEach(function(group) {
      group.clearSMTCTags(req.body.smtcTag, (err) => {
        if (err && !res.headersSent) {
          res.send(500, err.message);
          return;
        }
        // Save group
        group.save(function(err, numberAffected) {
          if (err) {
            res.status(err.status).send(err.message);
          } else if (!numberAffected) {
            res.sendStatus(404);
          } else {
            writelog.writeGroup(req, group, 'ClearTagsFromGroup');
            res.sendStatus(200);
          }
        });
      });
    });
  });
}

  // Delete an Group
exports.group_delete = (req, res, next) => {
  if (req.params._id === '_all') return next();
  Group.findById(req.params._id, (err, group) => {
    if (err) return res.status(err.status).send(err.message);
    if (!group) return res.sendStatus(404);
    group.remove((err) => {
      if (err) {
        return res.status(err.status).send(err.message);
      }
      writelog.writeGroup(req, group, 'deleteGroup');
      res.sendStatus(200);
    });
  });
}

  // Delete all Groups
exports.group_all_delete = (req, res) => {
  Group.find(function(err, groups) {
    if (err) return res.status(err.status).send(err.message);
    if (groups.length === 0) return res.sendStatus(200);
    var remaining = groups.length;
    groups.forEach(function(group) {
      // Delete each group explicitly to catch it in model
      group.remove((err) => {
        if (err) {
          if (!res.headersSent) res.status(err.status).send(err.message)
          return;
        }
        writelog.writeGroup(req, group, 'deleteGroup');
        if (--remaining === 0) return res.sendStatus(200);
      });
    });
  });
}


const parseQueryData = (queryString) => {
  if (!queryString) return {};
  if (queryString.before) queryString.storedAt = { $lte: queryString.before }
  if (queryString.after)  queryString.storedAt = Object.assign({}, queryString.storedAt, { $gte: queryString.after });
  let query = _.pick(queryString, Group.filterAttributes);
  if (query.tags) query.tags = tags.toArray(query.tags);
  return query;
}
