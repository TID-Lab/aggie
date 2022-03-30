var express = require('express');
var passport = require('passport');
var router = express.Router();
var authController = require('../controllers/authController')
const User = require('../../models/user');
const auth = require('../authentication')();

router.post("/login", passport.authenticate("local"), authController.login);
router.post("/register", authController.register);
router.get('/session', auth.authenticate(), authController.session);

module.exports = router;