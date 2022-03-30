'use strict'
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../../models/user');

// Get a list of all Users
router.get('', User.can('view users'), userController.user_users);

// Create a user
router.post('', User.can('admin users'), userController.user_create);

// Get Individual User
router.get('/:_id', User.can('view users'), userController.user_detail);

// Update Users
router.put('/:_id', User.can('update users'), userController.user_update);

// Delete User
router.delete('/:_id', User.can('admin users'), userController.user_delete);

module.exports = router;