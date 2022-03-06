'use strict'
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get a list of all Users
// user.can('view users')
router.get('/user', userController.user_users);

//user.can('admin users')
router.get('/user/:_id', userController.user_detail);

// user.can('admin users')
router.post('/user', userController.user_create);

// user.can('update users')
router.put('/user/:_id', userController.user_update);

// user.can('admin users')
router.delete('/user/:_id', userController.user_delete);

module.exports = router;