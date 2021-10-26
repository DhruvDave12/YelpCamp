const express = require('express');
const router = express.Router();
const catchAsync = require('../Utilities/catchAsync.js');
const Campground = require('../models/campground.js');
const Joi = require('joi');
const campgrounds = require("../controller/campground.js");
// Made a middleware file to keep it everywhere.
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js');

const multer = require('multer');
const {storage} = require('../cloudinary/index.js');
// here we are telling multer to store the stuff inside the storage we created in cloudinary.
const upload = multer({storage});

// We can group some similar routes like the get and post on the same path using router.route
router.route('/')
// Index Route
    .get(catchAsync(campgrounds.index))
    
// RIGHT NOW IN YELP-CAMP we have only three routes maybe which require JOI but if in a large application we had much more 
// routes at that moment we will be needing a middle ware to improve the code reusability.
// This is how we include middleware in a route, validateCampground goes before the main route fn. 
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
// All routes function are in controllers dir.
// upload single uploads only single file, and upload.array takes multiple and input should have multiple.

// 2.) Creating a new campground
router.get('/addcamp', isLoggedIn, campgrounds.newCampForm)


router.route('/:id')
// Show Page
    .get(catchAsync(campgrounds.getShowPage))
// Updating Route
    .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground,  catchAsync(campgrounds.editGround))
// Delete Route
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteGround))

// 4.) Edit a campground
router.get('/:id/editground', isLoggedIn, isAuthor, catchAsync(campgrounds.editGroundForm))

module.exports = router;