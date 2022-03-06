'use strict';
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

//user.can("view data")
router.get("/csv", csvController.csv_csv);

module.exports = router;