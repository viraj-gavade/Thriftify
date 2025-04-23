const express = require('express');

const OrderRouter = express.Router();
const upload = require('../Middlewares/multer.middleware'); // Import middleware for file uploads
const {CreateOrder,GetOrder,GetUserOrders } = require('../Controllers/orders.controllers'); // Import user controller functions
const VerifyJwt = require('../Middlewares/authentication.middleware');


OrderRouter.route('/').get((req, res) => {
    res.status(200).json({ message: 'User router path working' });
});

OrderRouter.route('/create-order').post(VerifyJwt,CreateOrder);
OrderRouter.route('/order/:id').get(VerifyJwt,GetOrder); // Get a single order by ID
OrderRouter.route('/user/orders').get(VerifyJwt, GetUserOrders); // Get all orders for the authenticated user



module.exports = OrderRouter;