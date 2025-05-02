const express = require('express');
const User = require('../Schemas/user.schemas'); // Import the User model
const UserRouter = express.Router();
const upload = require('../Middlewares/multer.middleware'); // Import middleware for file uploads
const { registerUser, loginUser, logoutUser, getUser, UpdateDetails, UpdateProfilePic, changeCurrentPassword } = require('../Controllers/user.controllers'); // Import user controller functions
const VerifyJwt = require('../Middlewares/authentication.middleware');

// Add this line to import the Listing model if not already imported
const Listing = require('../Schemas/listings.schemas');
const asyncHandler = require('../utils/asynchandler');

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
UserRouter.route('/logout').get(logoutUser);

// User profile page route
UserRouter.route('/profile')
    .get(VerifyJwt, async (req, res) => {
        try {
            const user = await User.findById(req.user._id)
            .populate('listings')
            .populate({
              path: 'orders',
              populate: {
                path: 'listing',
                select: 'title description price images'
              }
            })
            .populate('Bookmarks');
          
            
          
            
            console.log("User Orders:", user.orders);
            console.log("Bookmarks:", user.Bookmarks);
    
            res.render('profile', {
              user: user,
              listings: user.listings,
              orders: user.orders,
            });
          } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ error: 'Error loading profile' });
          }
    });

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

UserRouter.route('/bookmarks').get(VerifyJwt, async (req, res) => {
    try {
        // Get user data from req.user set by VerifyJwt middleware
        const user = await req.user.populate('Bookmarks');
        
        // Return bookmarks as a simple array for easier processing in frontend
        const bookmarks = user.Bookmarks.map(bookmark => ({
            listingId: bookmark._id,
            title: bookmark.title,
            // Include any other fields you might need
        }));
        
        res.status(200).json(bookmarks);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ error: 'Error loading bookmarks' });
    }
});


const GetUserOrders = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('orders');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Error fetching user orders' });
    }
}
)
// Add this new route for toggling bookmarks

UserRouter.route('/check-auth').get(VerifyJwt, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('listings').populate('Bookmarks');
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error checking authentication:', error);
        res.status(500).json({ error: 'Error checking authentication' });
    }
}
);

module.exports = UserRouter;
