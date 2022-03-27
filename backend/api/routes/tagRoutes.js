'use strict';
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
module.exports = function(user) {
// Get a list of all Tags
//user.can('view data')
  router.get('', tagController.tag_tags);

// Create a new Tag
// user.can('edit tags')
  router.post('', tagController.tag_create);

// Update a Tag
//user.can('edit tags')
  router.put('/:_id', tagController.tag_create);

// Delete a tag
//user.can('edit tags')
  router.delete('/:_id', tagController.tag_delete);
  return router;
}