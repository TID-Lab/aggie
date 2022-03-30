'use strict'
var express = require('express');
var router = express.Router();
const visualizationController = require('../controllers/visualizationController');
const User = require('../../models/user');

router.get("/", User.can("view data"), visualizationController.visualization_data);
module.exports = router;