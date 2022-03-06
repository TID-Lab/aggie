'use strict';
const express = require('express');
const router = express.Router();
const ctListController = require('../controllers/ctListController');

//user.can('view data')
router.get('/ctlist', ctListController.ctList_ctLists);

module.exports = router;
