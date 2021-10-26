const mongoose = require('mongoose');
// for code shortening
const Schema = mongoose.Schema;
const Review = require('./review.js');

const imageSchema = new Schema({

    url: String,
    fileName: String

});
// we need to update the url.
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300');
});

// through below line we can add virtuals to our json.

const opts = { toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({

    title: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            // will store object id and then we populate it later.
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    // in virtual this refers to that particular campground.
    return `<strong><a href = "/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`
});
// we need to remove all the reviews when we delete a campground
// so we will use findByIdAndDelete
// findByIdAndDelete triggers findOneAndDelete
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // so now when we delete a campground this middleware will be triggered.
    if (doc) {
        // below query means that we are going to delete all reviews for this particular id.
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', CampgroundSchema);
// https://res.cloudinary.com/demo/image/upload/c_crop,g_face,h_400,w_400/r_max/c_scale,w_200/lady.jpg