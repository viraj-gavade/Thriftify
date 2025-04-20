const express = require('express');

const UserRouter = express.Router();


UserRouter.route('/').get((req, res) => {
    res.status(200).json({ message: 'User router path working' });
});
UserRouter.route('/signin').post((req, res) => {
    res.status(200).json({ message: 'Login router path working' });
});

UserRouter.route('/signup').get((req, res) => {
    res.status(200).json({ message: 'signup router path working' });
});


UserRouter.route('/signout').get((req, res) => {
    res.status(200).json({ message: 'singout router path working' });
});



module.exports = UserRouter;
