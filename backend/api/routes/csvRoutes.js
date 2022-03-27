'use strict';
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

//
module.exports = function(user) {
  router.get("", user.can("view data"), csvController.csv_csv);
  return router;
}