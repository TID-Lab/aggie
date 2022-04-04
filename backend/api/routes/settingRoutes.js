'use strict';
const express = require('express');
const router = express.Router();
// Require controller modules.
const settingController = require('../controllers/settingsController');
const User = require('../../models/user');

// Turn fetching on or off
router.put('/fetching/:status', User.can('change settings'), settingController.setting_update_fetch);

// Request to update CTLists
router.put('/updateCTList', User.can('change settings'), settingController.setting_update_ctlist);

// Get Google Places API
router.get('/gplaces', User.can('change settings'), settingController.setting_gplaces);

// Get a setting
router.get('/:setting', User.can('change settings'), settingController.setting_setting);

// Update a setting
router.put('/:entry', User.can('change settings'), settingController.setting_update);

// Delete a setting
router.delete('/:entry', User.can('change settings'), settingController.setting_delete);

module.exports = router;