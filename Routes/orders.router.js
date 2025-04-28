const express = require('express');

const OrderRouter = express.Router();
const upload = require('../Middlewares/multer.middleware');
const {CreateOrder, GetOrder, GetUserOrders, DeleteUserOrder, capturePayment } = require('../Controllers/orders.controllers');
const VerifyJwt = require('../Middlewares/authentication.middleware');

// Base route
OrderRouter.route('/').get((req, res) => {
    res.status(200).json({ message: 'Order router path working' });
});

// Create order endpoint
OrderRouter.route('/create-order').post(VerifyJwt, CreateOrder);

// Make capture endpoint publicly accessible (no JWT) since it's called from payment-success page
OrderRouter.route('/capture').get(capturePayment);

// User order management routes with JWT protection
OrderRouter.route('/user/orders')
    .get(VerifyJwt, GetUserOrders)
    .delete(VerifyJwt, DeleteUserOrder);

// Get single order by ID
OrderRouter.route('/order/:id').get(VerifyJwt, GetOrder);

module.exports = OrderRouter;