'use strict';
const express = require('express');
const router = express.Router();
const ctListController = require('../controllers/ctListController');
const User = require('../../models/user');

// Get all ct_lists
router.get('', User.can('view data'), ctListController.ctList_ctLists);

module.exports = router;
