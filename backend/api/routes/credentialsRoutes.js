'use strict';
const express = require('express');
const router = express.Router();
const credentialsController = require('../controllers/credentialsController');

module.exports = function(user) {
  //user.can('change settings')
  router.get('', user.can('change settings'), credentialsController.credential_credentials);

  //user.can('change settings'),
  router.post('', user.can('change settings'), credentialsController.credential_create);

  // Delete credentials
  //user.can('change settings'),
  router.delete('/:_id', user.can('change settings'), credentialsController.credential_delete);

  // Get a set of (stripped) credentials by its ID
  //user.can('change settings')
  router.get('/:_id', user.can('change settings'), credentialsController.credential_details);
  return router;
}