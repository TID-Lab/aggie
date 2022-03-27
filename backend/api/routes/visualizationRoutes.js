'use strict'
var express = require('express');
var router = express.Router();
const visualizationController = require('../controllers/visualizationController');
module.exports = function(user) {
  router.get("/", visualizationController.visualization_data);
  return router;
}