'use strict';
const express = require('express');
const router = express.Router();
const sourceController = require('../controllers/sourceController');


//user.can('edit data'
router.post('/source', sourceController.source_create);

// Get a list of all Sources
//user.can('view data')
router.get('/source', sourceController.source_sources);

// Get a Source by _id
//user.can('view data')
router.get('/source/:_id', sourceController.source_details);

// Update a Source
//user.can('edit data')
router.put('/source/:_id', sourceController.source_update);

// Reset unread error count
//user.can('edit data')
router.put('/source/_events/:_id', sourceController.source_reset_errors);

//user.can('edit data')
// Delete a Source
router.delete('/source/:_id', sourceController.source_delete);

// Delete all sources
//user.can('delete data')
router.delete('/source/_all', sourceController.source_delete_all);

// user.can('edit data')
router.put('/source/_all', sourceController.source_update_all);

module.exports = router;