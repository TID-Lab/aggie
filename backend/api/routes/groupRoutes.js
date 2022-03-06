'use strict';
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Create a new Group
// user.can('edit data')
router.post('/group', groupController.group_create);

// Get a list of all Groups
    //user.can('view data')
router.get('/group', groupController.group_groups);

// Get a Group by _id
    //user.can('view data')
router.get('/group/:_id', groupController.group_details);

// Update a group
//user.can('edit data'),
router.put('/group/:_id', groupController.group_update);

// Delete selected Groups
// user.can('edit data')
router.post('/group/_selected', groupController.group_selected_delete);

// user.can('edit data')
router.patch('/group/_tag', groupController.group_tags_add);

//  user.can('edit data')
router.patch('/group/_untag', groupController.group_tags_remove);

//user.can('edit data')
router.patch('/group/_clearTags', groupController.group_tags_clear);

// user.can('edit data')
router.delete('/group/:_id', groupController.group_delete);

// user.can('edit data'),
router.delete('/group/_all', groupController.group_all_delete);

module.exports = router;