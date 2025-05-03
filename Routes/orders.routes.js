const express = require('express');
const router = express.Router();
const { 
    CreateOrder, 
    GetOrder, 
    GetUserOrders, 
    DeleteUserOrder, 
    capturePayment,
    ViewOrderDetails 
} = require('../Controllers/orders.controllers');
const  VerifyJwt  = require('../Middlewares/authentication.middleware');

// Order routes
router.post('/create', VerifyJwt, CreateOrder);
router.get('/:id', VerifyJwt, GetOrder);
router.get('/', VerifyJwt, GetUserOrders);
router.delete('/delete/:orderId', VerifyJwt, DeleteUserOrder);

// Payment routes
router.get('/payment/capture', capturePayment);

// Web route for viewing order details
router.get('/view/:id', VerifyJwt, ViewOrderDetails);

module.exports = router;
