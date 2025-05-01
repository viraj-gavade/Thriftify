const express = require('express');
const VerifyJwt = require('../Middlewares/authentication.middleware');
const router = express.Router();


// Render the chat page
router.get('/', VerifyJwt, (req, res) => {
  res.render('chat', {
    title: 'Messages',
    user: req.user
  });
});

module.exports = router;
