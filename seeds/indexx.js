const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const cities = require('./cities.js');
const { places, descriptors } = require('./seedHelpers.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp');
// logic to check if database connected
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error: "));
db.once("open", () => {
    console.log("DATABASE CONNECTED");
});


// From here we can seed our data
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // YOUR USER ID
            author: '615c28f2cd39683390403821',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odit quos numquam molestiae eaque, beatae magnam eligendi dolorum quia similique tempora facilis aliquid obcaecati quam at minima nostrum ad corporis ullam?',
            price: price,
            geometry:
            {
                type: "Point",
                // IN mapbox we have to keep longitude first and then latitude
                coordinates: [cities[random1000].longitude,
                              cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dlppdyyb2/image/upload/v1634301588/YelpCamp/kulbgghcshs1ueacqivq.jpg',
                    fileName: 'YelpCamp/kulbgghcshs1ueacqivq',

                },
                {
                    url: 'https://res.cloudinary.com/dlppdyyb2/image/upload/v1634301588/YelpCamp/kulbgghcshs1ueacqivq.jpg',
                    fileName: 'YelpCamp/kulbgghcshs1ueacqivq',
                }
            ]
        })

        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});