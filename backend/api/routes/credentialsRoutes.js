'use strict';
const express = require('express');
const router = express.Router();
const credentialsController = require('../controllers/credentialsController');
const {credential_credentials} = require("../controllers/credentialsController");

//user.can('change settings'),
router.post('/credentials', credentialsController.credential_create);

// Delete credentials
//user.can('change settings'),
router.delete('/credentials/:_id',credentialsController.credential_delete);

//user.can('change settings')
router.get('/credentials', credentialsController.credential_credentials);

// Get a set of (stripped) credentials by its ID
//user.can('change settings')
router.get('/credentials/:_id', credentialsController.credential_details);

module.exports = router;