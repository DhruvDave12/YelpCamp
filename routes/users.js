const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user.js');
const catchAsync = require('../Utilities/catchAsync.js');
const users = require('../controller/users.js');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.registerUser))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.loginUser)

router.get('/logout', users.logoutUser)
module.exports = router;