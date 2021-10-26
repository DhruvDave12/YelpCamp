const express = require('express');
// merge params is because before we formed a route prefix with id but express router likes to keep it differnt.
// So we merge the params and then we can access it.
const router = express.Router({mergeParams: true});
const Review = require('../models/review.js');
const catchAsync = require('../Utilities/catchAsync.js');
const Campground = require('../models/campground.js');
const {validateCampgroundReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const reviews = require('../controller/review.js');

// Review Form Submission Route
router.post('/', validateCampgroundReview, isLoggedIn ,catchAsync(reviews.createReview))

// Deleting a review route
router.delete('/:reviewId', isLoggedIn , isReviewAuthor ,catchAsync(reviews.deleteReview));

module.exports = router;