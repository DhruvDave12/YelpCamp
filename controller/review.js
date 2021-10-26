const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

module.exports.createReview = async(req,res) => {
    const{body, rating} = req.body;
    const campground = await Campground.findById(req.params.id);
    const review  = new Review({
       body: body,
       rating: rating,
   })
//    console.log(req.user._id);
   review.author = req.user._id;
   campground.reviews.push(review);
   await review.save()
   await campground.save();
   req.flash('success', 'Created new review!');
   res.redirect(`/campgrounds/${campground._id}`);
};


module.exports.deleteReview = async(req,res) => {
    const{reviewId, id} = req.params;

    // this pull method mongo searches for a parameter we provide and pulls it out,
    // so we pulled it out and deleted it from the review model also.
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');

    res.redirect(`/campgrounds/${id}`);

};