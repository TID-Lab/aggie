'use strict';
const express = require('express');
const router = express.Router();

// Require controller modules.
const settingController = require('../controllers/settingsController');
module.exports = function(user) {
// Turn fetching on or off
  router.put('/fetching/:op', (req, res) => {
    settingController.setting_update_fetch(req, res, user.can('change settings'))
  });

// Request to update CTLists
  router.put('/updateCTList', settingController.setting_update_ctlist);

// Get Google Places API
  router.get('/gplaces', settingController.setting_gplaces);

// Get a setting
  router.get('/:setting', (req, res) => {
    settingController.setting(req, res, user.can('change settings'))
  });

// Update a setting
  router.put('/:entry', (req, res) => {
    settingController.setting_update(req, res, user.can('change settings'));
  });

// Delete a setting
  router.delete('/:entry', (req, res) => {
    settingController.setting_delete(req, res, user.can('change settings'));
  });
  return router;
}