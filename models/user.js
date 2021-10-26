const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// this will automatically add username and password fields into the schema
userSchema.plugin(passportLocalMongoose);
// passport.js is a tool for authentication it will put all validations for username and password.
module.exports = mongoose.model('User', userSchema);