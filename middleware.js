const Review = require('./models/review.js');
const Campground = require('./models/campground.js');
const {campgroundSchema} = require('./ErrorSchema/schemas.js');
const ExpressError = require('./Utilities/ExpressError.js');
const {reviewSchema} = require('./ErrorSchema/schemas.js');

module.exports.isLoggedIn = (req, res, next) => {
    // method from passport
    // we have a method called req.user where if we are not authenticated
    // it returns undefined else it shows the details of the user.
    if (!req.isAuthenticated()) {
        // store the url they are requesting.
        // console.log(req.path, req.originalUrl);
        // req.path and req.originalUrl stores the url which is encountered when not logged in.
        // we will be storing the requested url in a session
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

// authorization middleware
module.exports.isAuthor = async(req,res, next) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
        req.flash('error', 'You dont own this campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


// JOI MIDDLEWARE 
module.exports.validateCampground = (req,res,next) => {
        
    // Destructured error from here.
    const { error } =  campgroundSchema.validate(req.body);
    // result.error.details is an array so we need to map over it and make it a string to display.

    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}


// Review Middleware
// Validating review using Joi
module.exports.validateCampgroundReview = (req,res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

module.exports.isReviewAuthor = async(req,res,next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You dont own this campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}