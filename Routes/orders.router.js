const express = require('express');

const OrderRouter = express.Router();
const upload = require('../Middlewares/multer.middleware'); // Import middleware for file uploads
const {CreateOrder,GetOrder,GetUserOrders,DeleteUserOrder,capturePayment } = require('../Controllers/orders.controllers'); // Import user controller functions
const VerifyJwt = require('../Middlewares/authentication.middleware');


OrderRouter.route('/').get((req, res) => {
    res.status(200).json({ message: 'User router path working' });
});

OrderRouter.route('/create-order').post(VerifyJwt,CreateOrder);
OrderRouter.route('/user/orders').delete(VerifyJwt, DeleteUserOrder); // Get all orders for the authenticated user
OrderRouter.route('/order/:id').get(VerifyJwt,GetOrder); // Get a single order by ID
OrderRouter.route('/order/capture/:id').get(VerifyJwt,capturePayment); // Get a single order by ID
OrderRouter.route('/user/orders').get(VerifyJwt,GetUserOrders); // Get a single order by ID



module.exports = OrderRouter;