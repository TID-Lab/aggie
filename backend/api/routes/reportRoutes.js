'use strict';
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

module.exports = function(user) {
// Get list of reports
//user.can('view data')
  router.get('', reportController.report_reports);

// Get batch of reports
//user.can('view data')
  router.get('/batch', reportController.report_batch);

// Get new batch of reports
//user.can('edit data')
  router.patch('/batch', reportController.report_batch_new);

// Cancel batch of reports
// user.can('edit data')
  router.put('/batch', reportController.report_batch_cancel);

// Get report details
//user.can('view data')
  router.get('/:_id', reportController.report_details);

// Get report comments
//user.can('view data')
  router.get('/comments/:_id', reportController.report_comments);

// Update individual report
//user.can('edit data')
  router.put('/:_id', reportController.report_update);

// Update reports veracity
//user.can('edit data')
  router.patch('/_veracity', reportController.report_selected_veracity_update);

// Update reports read
// user.can('edit data')
  router.patch('/_read', reportController.report_selected_read_update);

// Update reports escalation
//user.can('edit data')
  router.patch('/_escalate', reportController.report_selected_escalated_update);

// Add reports group
//user.can('edit data')
  router.patch('/_link', reportController.report_selected_group_update);

// Remove reports group
// user.can('edit data')
  router.patch('/_unlink', reportController.report_selected_ungroup_update);

// Update reports notes
//user.can('edit data')
  router.patch('/_updateNotes', reportController.report_selected_notes_update);

// Add tag to reports
//user.can('edit data')
  router.patch('/_tag', reportController.report_selected_tags_add);

// Remove tag from reports
//user.can('edit data')
  router.patch('/_untag', reportController.report_selected_tags_remove);

// Clear tags from reports
//user.can('edit data')
  router.patch('/_clearTags', reportController.report_selected_tags_clear);
  return router;
}