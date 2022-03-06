'use strict'
var express = require('express');
var router = express.Router();
const visualizationController = require('../controllers/visualizationController');

router.get("/viz", visualizationController.visualization_data);

module.exports = router;