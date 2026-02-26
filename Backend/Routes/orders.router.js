/**
 * @fileoverview Order routes for e-commerce functionality
 * Handles order creation, retrieval, payment processing, and management
 */

// Express framework for creating route handlers
const express = require('express');
const router = express.Router();

// Order controller functions implementing the business logic
const { 
    CreateOrder, 
    GetOrder, 
    GetUserOrders, 
    DeleteUserOrder, 
    capturePayment,
    ViewOrderDetails 
} = require('../Controllers/orders.controllers');

// Authentication middleware to protect routes that require user login
const verifyJWT = require('../Middlewares/authentication.middleware');

/**
 * Create a new order
 * POST /create
 * Requires authentication
 */
router.post('/create', verifyJWT, CreateOrder);

/**
 * Get all orders for the authenticated user
 * GET /
 * Requires authentication
 */
router.get('/', verifyJWT, GetUserOrders);

/**
 * Capture payment for an order
 * GET /payment/capture
 * Handles payment service callbacks
 */
router.get('/payment/capture', capturePayment);

/**
 * View order details page
 * GET /view/:id
 * Requires authentication
 */
router.get('/view/:id', verifyJWT, ViewOrderDetails);

/**
 * Delete a user's order by ID
 * DELETE /delete/:orderId
 * Requires authentication
 */
router.delete('/delete/:orderId', verifyJWT, DeleteUserOrder);

/**
 * Get a specific order by ID
 * GET /:id
 * Requires authentication
 */
router.get('/:id', verifyJWT, GetOrder);

module.exports = router;
