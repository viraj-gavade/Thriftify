const express = require('express');

const UserRouter = express.Router();
const upload = require('../Middlewares/multer.middleware'); // Import middleware for file uploads
const { registerUser, loginUser,logoutUser,getUser,UpdateDetails,UpdateProfilePic , changeCurrentPassword} = require('../Controllers/user.controllers'); // Import user controller functions
const VerifyJwt = require('../Middlewares/authentication.middleware');

UserRouter.route('/').get((req, res) => {
    res.status(200).json({ message: 'User router path working' });
});
UserRouter.route('/signup')
    .get((req, res) => {
        res.render('signup');
    })
    .post( 
        upload.fields([
            { name: 'profilepic', maxCount: 1 },
        ]), 
        registerUser
    );

// Signin route: renders the signin page and handles user login
UserRouter.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post(loginUser);

// Logout route: handles user logout
UserRouter.route('/signout').get(logoutUser);

UserRouter.route('/profile/:id').get(getUser);

UserRouter.route('/update-details').patch(VerifyJwt,UpdateDetails);

UserRouter.route('/update-password').patch(VerifyJwt,changeCurrentPassword);

UserRouter.route('/update-profilepic')
    .patch( 
        upload.fields([
            { name: 'profilepic', maxCount: 1 },
        ]), 
       VerifyJwt, UpdateProfilePic
    );

module.exports = UserRouter;
