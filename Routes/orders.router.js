const express = require('express');

const OrderRouter = express.Router();
const upload = require('../Middlewares/multer.middleware'); // Import middleware for file uploads
const {CreateOrder } = require('../Controllers/orders.controllers'); // Import user controller functions
const VerifyJwt = require('../Middlewares/authentication.middleware');


OrderRouter.route('/').get((req, res) => {
    res.status(200).json({ message: 'User router path working' });
});

OrderRouter.route('/create-order').post(VerifyJwt,CreateOrder);


module.exports = OrderRouter;