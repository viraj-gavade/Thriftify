/**
 * @fileoverview Support routes for handling customer support requests
 * Defines endpoints for support page and form submissions
 */

const express = require('express');
const router = express.Router();
const verifyJWT = require('../Middlewares/authentication.middleware');
const asyncHandler = require('../utils/asynchandler');

/**
 * Render the support page
 * GET /support
 */
router.get('/', (req, res) => {
  res.render('support', {
    title: 'Support | Thriftify',
    user: req.user
  });
});

/**
 * Submit a support request
 * POST /submit
 */
router.post('/submit', asyncHandler(async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate form inputs
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // In a production environment, you would typically:
    // 1. Save the support request to the database
    // 2. Send an email notification to support staff
    // 3. Send a confirmation email to the user
    
    // For this example, we'll simulate success and redirect
    
    // Set flash message for user feedback (if you have flash middleware set up)
    // req.flash('success', 'Your support request has been submitted. We will contact you shortly.');
    
    // Redirect to success page or back to support with query param
    return res.status(200).json({
      status: 'success',
      message: 'Your support request has been submitted. We will contact you shortly.'
    });
    
  } catch (error) {
    console.error('Support request error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while submitting your request. Please try again later.'
    });
  }
}));

module.exports = router;
