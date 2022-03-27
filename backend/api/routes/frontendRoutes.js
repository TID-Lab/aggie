'use strict';
const express = require('express');
const router = express.Router();
const frontendController = require('../controllers/frontendController');

//
module.exports = function(user) {
  router.get("/reports*", frontendController.frontend_index);
  router.get('/', frontendController.frontend_index);
  return router;
}