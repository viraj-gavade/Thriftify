/**
 * @fileoverview Search router for Thriftify application
 */

const express = require('express');
const router = express.Router();
const { searchListings } = require('../Controllers/search.controller');

/**
 * Search endpoint
 * GET /search?q=query&category=category&location=location
 */
router.get('/', searchListings);

module.exports = router;
