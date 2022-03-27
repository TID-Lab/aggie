'use strict'
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
module.exports = function(user) {
// Get a list of all Users
// user.can('view users')
  router.get('', userController.user_users);

// user.can('admin users')
  router.post('', userController.user_create);

//.can('admin users')
  router.get('/:_id', userController.user_detail);

// user.can('update users')
  router.put('/:_id', userController.user_update);

// user.can('admin users')
  router.delete('/:_id', userController.user_delete);
  return router;
}