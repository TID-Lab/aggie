'use strict';
const express = require('express');
const router = express.Router();
const sourceController = require('../controllers/sourceController');
const User = require('../../models/user');

//User.can('edit data'
router.post('', User.can('edit data'), sourceController.source_create);

// Get a list of all Sources
router.get('', User.can('view data'), sourceController.source_sources);

// Get a Source by _id
router.get('/:_id', User.can('view data'), sourceController.source_details);

// Update a Source
router.put('/:_id', User.can('edit data'), sourceController.source_update);

// Reset unread error count
router.put('/_events/:_id', User.can('edit data'), sourceController.source_reset_errors);

// Delete a Source
router.delete('/:_id', User.can('edit data'), sourceController.source_delete);

// Delete all sources
router.delete('/_all', User.can('delete data'), sourceController.source_delete_all);

// Update all sources
router.put('/_all',  User.can('edit data'), sourceController.source_update_all);

module.exports = router;