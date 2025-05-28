/**
 * @fileoverview Environment variable configuration loader
 * Centralizes access to environment variables for database connection
 */

// dotenv for loading environment variables from .env file
// Used to make environment variables available via process.env
require('dotenv').config();

// MongoDB connection URI from environment variables
const MONGO_URI = process.env.MONGO_URI;

// Database name from environment variables
const DB_NAME = process.env.DB_NAME;

// Export constants for use in database connection
module.exports = {
    MONGO_URI,
    DB_NAME,
};
