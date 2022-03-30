'use strict';
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');
const User = require('../../models/user');

// Get CSV
router.get("", User.can("view data"), csvController.csv_csv);

module.exports = router;