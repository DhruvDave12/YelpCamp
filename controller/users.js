const User = require('../models/user.js');

module.exports.renderRegister =  (req, res) => {
    res.render('auth/register.ejs');
};

module.exports.registerUser = async (req, res, next) => {
    // to create a new user we just store the email and username and password goes in it by passport 
    try {
        const { email, username, password } = req.body;
        const user = new User({
            email,
            username
        });

        // we created a user above then we use this method of passport .register
        // it takes the password and hashes it.
        const registeredUser = await User.register(user, password);
        // passport method.
        // this is just for 
        req.login(registeredUser, err=>{
            if(err){
                return next(err);
            }
            req.flash('success', "Welcome to YelpCamp!");
            res.redirect('/campgrounds');
        });
       

    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register')
    }
    // console.log(registeredUser);
};

module.exports.renderLogin = (req,res)=>{
    res.render('auth/login.ejs');
};

module.exports.loginUser = (req,res) => {
    // we will use passport to handle login .... we use the local strategy.
    req.flash('success', 'Welcome Back');
    const redirectURL = req.session.returnTo || '/campgrounds';
    // now we will delete the returnTo
    delete req.session.returnTo;
    
    res.redirect(redirectURL);
};

module.exports.logoutUser = (req,res)=>{
    req.logout();
    req.flash('success', "Good Bye");
    res.redirect('/campgrounds');
};