'use strict';
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Get a list of all Tags
//user.can('view data')
router.get('/tag', tagController.tag_tags);

// Create a new Tag
// user.can('edit tags')
router.post('/tag', tagController.tag_create);

// Update a Tag
//user.can('edit tags')
router.put('/tag/:_id', tagController.tag_create);

// Delete a tag
//user.can('edit tags')
router.delete('/tag/:_id', tagController.tag_delete);

module.exports = router;