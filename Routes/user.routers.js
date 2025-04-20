const express = require('express');

const UserRouter = express.Router();
const upload = require('../Middlewares/multer.middleware'); // Import middleware for file uploads
const { registerUser, loginUser,logoutUser } = require('../Controllers/user.controllers'); // Import user controller functions

UserRouter.route('/').get((req, res) => {
    res.status(200).json({ message: 'User router path working' });
});
UserRouter.route('/signup')
    .get((req, res) => {
        res.render('SignUp');
    })
    .post( 
        upload.fields([
            { name: 'profilepic', maxCount: 1 },
        ]), 
        registerUser
    );

// Signin route: renders the signin page and handles user login
UserRouter.route('/signin')
    .get((req, res) => {
        res.render('SignIn');
    })
    .post(loginUser);

// Logout route: handles user logout
UserRouter.route('/logout').get(logoutUser);


module.exports = UserRouter;
