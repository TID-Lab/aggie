'use strict';
const express = require('express');
const router = express.Router();

// Require controller modules.
const settingController = require('../controllers/settingsController');

// Turn fetching on or off
router.put('/settings/fetching/:op', (req, res) => {
  settingController.setting_update_fetch(req, res, user.can('change settings'))
});

// Request to update CTLists
router.put('/settings/updateCTList', settingController.setting_update_ctlist);

// Get Google Places API
router.get('/settings/gplaces', settingController.setting_gplaces);

// Get a setting
router.get('/settings/:setting', (req, res) => {
  settingController.setting(req, res, user.can('change settings'))
});

// Update a setting
router.put('/settings/:entry', (req, res) => {
  settingController.setting_update(req, res, user.can('change settings'));
});

// Delete a setting
router.delete('/settings/:entry', (req, res) => {
  settingController.setting_delete(req, res, user.can('change settings'));
});

module.exports = router;