'use strict';
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../authentication')();
const User = require('../../models/user');

// Get list of reports
router.get('', User.can("view data"), reportController.report_reports);

// Get batch of reports
router.get('/batch', User.can('view data'), reportController.report_batch);

// Get new batch of reports
router.patch('/batch', User.can('edit data'), reportController.report_batch_new);

// Cancel batch of reports
router.put('/batch', User.can('edit data'), reportController.report_batch_cancel);

// Get report details
router.get('/:_id', User.can('view data'), reportController.report_details);

// Get report comments
router.get('/comments/:_id', User.can('view data'), reportController.report_comments);

// Update individual report
router.put('/:_id', User.can('edit data'), reportController.report_update);

// Update reports veracity
router.patch('/_veracity', User.can('edit data'), reportController.report_selected_veracity_update);

// Update reports read
router.patch('/_read', User.can('edit data'), reportController.report_selected_read_update);

// Update reports escalation
router.patch('/_escalate', User.can('edit data'), reportController.report_selected_escalated_update);

// Add reports group
router.patch('/_link', User.can('edit data'), reportController.report_selected_group_update);

// Remove reports group
router.patch('/_unlink', User.can('edit data'), reportController.report_selected_ungroup_update);

// Update reports notes
router.patch('/_updateNotes', User.can('edit data'), reportController.report_selected_notes_update);

// Add tag to reports
router.patch('/_tag', User.can('edit data'), reportController.report_selected_tags_add);

// Remove tag from reports
router.patch('/_untag', User.can('edit data'), reportController.report_selected_tags_remove);

// Clear tags from reports
router.patch('/_clearTags', User.can('edit data'), reportController.report_selected_tags_clear);

module.exports = router;
