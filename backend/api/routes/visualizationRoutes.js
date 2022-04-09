'use strict'
var express = require('express');
var router = express.Router();
const visualizationController = require('../controllers/visualizationController');
const User = require('../../models/user');

router.get("/media", User.can("view data"), visualizationController.visualization_media);
router.get("/time", User.can("view data"), visualizationController.visualization_time);
router.get("/tags", User.can("view data"), visualizationController.visualization_tags);
router.get("/authors", User.can("view data"), visualizationController.visualization_authors);
router.get("/words", User.can("view data"), visualizationController.visualization_words);

module.exports = router;