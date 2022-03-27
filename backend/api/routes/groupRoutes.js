'use strict';
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

module.exports = function(user) {
// Create a new Group
// user.can('edit data')
  router.post('/', groupController.group_create);

// Get a list of all Groups
  //user.can('view data')
  router.get('/', user.can('view data'), groupController.group_groups);

// Get a Group by _id
  //user.can('view data')
  router.get('/:_id', user.can('view data'), groupController.group_details);

// Update a group
//user.can('edit data'),
  router.put('/:_id', groupController.group_update);

// Delete selected Groups
// user.can('edit data')
  router.post('/_selected', user.can('edit data'), groupController.group_selected_delete);

// user.can('edit data')
  router.patch('/_tag', user.can('edit data'), groupController.group_tags_add);

//  user.can('edit data')
  router.patch('/_untag', user.can('edit data'), groupController.group_tags_remove);

//user.can('edit data')
  router.patch('/_clearTags', groupController.group_tags_clear);

// user.can('edit data')
  router.delete('/:_id', groupController.group_delete);

// user.can('edit data'),
  router.delete('/_all', groupController.group_all_delete);
  return router;
}