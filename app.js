// dotenv we can access data in .env file here
// rn we are in development mode so i can access here... but as soon as i go in production mode
// we are gonna ignore.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./Utilities/ExpressError.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// Using below package we can store session information in mongo atlas
const MongoStore = require('connect-mongo');

// requiring the route files
const campRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/users.js');

// This is mongo's cloud database
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

// const { findByIdAndRemove, findByIdAndDelete } = require('./models/campground.js');
// const { nextTick } = require('process');
// const { valid } = require('joi');

// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl);
// logic to check if database connected
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error: "));
db.once("open", () => {
    console.log("DATABASE CONNECTED");
});

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const app = express();
// using ejs mate here.
app.engine('ejs', ejsMate);
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// this line is for getting data in req.body.
app.use(express.urlencoded({ extended: true }));
// serving public directory
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}));

// Creating a mongodb store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    // touch after is that if user makes any change then update session but if he/she doesnt then
    // simply just update or save in given amount of time to avoid unnecessary saves.
    touchAfter: 24 * 60 * 60,
})

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
})
// Serving sessions
const sessionConfig = {
    // Uses mongo to store information
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,

    // Fancier Options for cookies like setting an expiration date.
    cookie: {
        httpOnly: true, // makes it not accessible on other client js
        // secure: true, // cookies can be secured only with https.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
// SERVING FLASH
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    // "https://maxcdn.bootstrapcdn.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css",
    "http://localhost:3000/favicon.ico",

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    // "https://maxcdn.bootstrapcdn.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css",
    "http://localhost:3000/favicon.ico",

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlppdyyb2/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Passport Usage
app.use(passport.initialize());
app.use(passport.session()); // REMEMBER app.use(session) must come before passport.session.
// this below line tells that we will be using a local strategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // serializing the user in session
passport.deserializeUser(User.deserializeUser()); // deserializing the user out of the session.


// FLASH MIDDLEWARE
app.use((req, res, next) => {
    // under the locals key successs we will be having the message we provide with success type flashing.
    // res.locals makes that thing available on all templates.
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// WE CREATED A SEPRATE FILE FOR ALL ROUTES
// CAMPGROUND ROUTES
app.use('/campgrounds', campRoutes);
// REVIEW ROUTES
app.use('/campgrounds/:id/reviews', reviewRoutes);
// USER ROUTES
// KEEP THIS USER ROUTE ALWAYS BELOW THE PASSPORT
app.use('/', userRoutes);


// Routes
app.get('/', (req, res) => {
    res.render('campground/home.ejs');
});
// this will run only when nothin above matches
// if page doesnt exist we can put the 404 status code.
// This is executed only when none of the error matches so we put this.
// Example -> going on a page that doesnt exist.
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found'), 404);
})

// Custom Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Something went wrong";
    }
    res.status(statusCode).render('campground/error.ejs', { err });
})

const port = process.env.PORT || 3000;
// Listening to a port
app.listen(port, (req, res) => {
    console.log(`LISTENING TO PORT ${port}!!`);
})
// To get specific errors for specific fields we can use the JOI tool
// In JOI tool i can create a schema.











