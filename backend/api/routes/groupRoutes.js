'use strict';
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const User = require('../../models/user');


// Create a new Group
// User.can('edit data')
router.post('/', User.can('edit data'), groupController.group_create);

// Get a list of all Groups
//User.can('view data')
router.get('/', User.can('view data'), groupController.group_groups);

// Get a Group by _id
//User.can('view data')
router.get('/:_id', User.can('view data'), groupController.group_details);

// Update a group
//User.can('edit data'),
router.put('/:_id', User.can('edit data'), groupController.group_update);

// Delete selected Groups
// User.can('edit data')
router.post('/_selected', User.can('edit data'), groupController.group_selected_delete);

// User.can('edit data')
router.patch('/_tag', User.can('edit data'), groupController.group_tags_add);

//  User.can('edit data')
router.patch('/_untag', User.can('edit data'), groupController.group_tags_remove);

//User.can('edit data')
router.patch('/_clearTags', groupController.group_tags_clear);

// User.can('edit data')
router.delete('/:_id', groupController.group_delete);

// User.can('edit data'),
router.delete('/_all', groupController.group_all_delete);
module.exports = router;
