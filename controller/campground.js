const Campground = require('../models/campground.js');
const {cloudinary} = require('../cloudinary/index.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const campground = await Campground.find({});
    res.render('campground/index.ejs', { campground });
};

module.exports.newCampForm = (req, res) => {
    res.render('campground/new.ejs');
};

module.exports.createCampground = async (req, res, next) => {
    // const{ title, location, price, description, image} = req.body;

    // const campObjj = {
    //     location: location,
    //     title: title,
    //     image: image,
    //     description: description,
    //     price: price
    // }

    // We passed the whole req.body instead of doing the above stuff.
    // You can check this in 

    // This is traditional long method to get error for every field rather we would be using JOI.
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 500);
    // now we need to use the forward.
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    // it returns us longitude,latitude but we need opposite so we reverse it.
    const newCampGround = new Campground(req.body);
    newCampGround.images = req.files.map(f => ({ url: f.path, fileName: f.filename }))
    newCampGround.author = req.user._id;
    newCampGround.geometry = geoData.body.features[0].geometry;
    await newCampGround.save();
    console.log(newCampGround);
    // FLASHING MSG HERE
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${newCampGround._id}`); 
};

module.exports.getShowPage = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id).populate(
        {
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');

    console.log(foundCampground);
    if (!foundCampground) {
        req.flash('error', 'Cannot find the campground');
        res.redirect('/campgrounds');
    }
    res.render('campground/show.ejs', { foundCampground })
}

module.exports.editGroundForm = async (req, res) => {
    const { id } = req.params;

    const newCampground = await Campground.findById(id);
    if (!newCampground) {
        req.flash('error', 'Cannot find the campground');
        res.redirect('/campgrounds');
    }
    res.render('campground/edit.ejs', { newCampground });
};


module.exports.editGround = async (req, res, next) => {
    // const {newTitle, newLocation} = req.body;
    const { id } = req.params;

    // const updatedGround = await Campground.findByIdAndUpdate(id, {
    //     title: newTitle,
    //     location: newLocation
    // });
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();

    const updatedGround1 = await Campground.findByIdAndUpdate(id, req.body);
    const imgs = req.files.map(f => ({ url: f.path, fileName: f.filename }));
    // above we got an array of images now we will spread it so that we get all in our images array. 
    // ...imgs just takes data from the array (imgs) and then puts it into our array.
    updatedGround1.images.push(...imgs)
    updatedGround1.geometry = geoData.body.features[0].geometry;
    await updatedGround1.save();

    if (req.body.deleteImages) {
        // Below piece of code means that pull all those images with a filename in the req.body.deleteImages array.
        for(let fileName of req.body.deleteImages){
            await cloudinary.uploader.destroy(fileName);
        }
        await updatedGround1.updateOne({$pull: {images: {fileName: {$in: req.body.deleteImages } } } } );
    }

    // console.log(updatedGround1);
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteGround = async (req, res) => {
    const { id } = req.params;

    await Campground.findByIdAndDelete(id);

    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};