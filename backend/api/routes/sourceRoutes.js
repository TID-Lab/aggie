'use strict';
const express = require('express');
const router = express.Router();
const sourceController = require('../controllers/sourceController');

module.exports = function(user) {
//user.can('edit data'
  router.post('', user.can('edit data'), sourceController.source_create);

// Get a list of all Sources
//user.can('view data')
  router.get('', sourceController.source_sources);

// Get a Source by _id
//user.can('view data')
  router.get('/:_id', sourceController.source_details);

// Update a Source
//user.can('edit data')
  router.put('/:_id', sourceController.source_update);

// Reset unread error count
//user.can('edit data')
  router.put('/_events/:_id', sourceController.source_reset_errors);

//user.can('edit data')
// Delete a Source
  router.delete('/:_id', sourceController.source_delete);

// Delete all sources
//user.can('delete data')
  router.delete('/_all', sourceController.source_delete_all);

// user.can('edit data')
  router.put('/_all', sourceController.source_update_all);
  return router;
}