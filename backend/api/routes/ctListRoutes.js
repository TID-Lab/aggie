'use strict';
const express = require('express');
const router = express.Router();
const ctListController = require('../controllers/ctListController');

//
module.exports = function(user) {
  router.get('', user.can('view data'), ctListController.ctList_ctLists);
  return router;
}
