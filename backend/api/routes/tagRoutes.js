'use strict';
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const User = require('../../models/user');

// Get a list of all Tags
router.get('', User.can('view data'), tagController.tag_tags);

// Create a new Tag
router.post('', User.can('edit tags'), tagController.tag_create);

// Update a Tag
router.put('/:_id', User.can('edit tags'), tagController.tag_update);

// Delete a tag
router.delete('/:_id', User.can('edit tags'), tagController.tag_delete);

module.exports = router;
