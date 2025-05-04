/**
 * @fileoverview Database connection module for MongoDB using Mongoose
 * Establishes and manages the connection to MongoDB for the Thriftify application
 */

// Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js
// Used to create schemas, models, and handle database operations throughout the application
const mongoose = require('mongoose');

// Imports environment variables from constants file
// These include MONGO_URI and DB_NAME needed for the database connection below
require('../utils/constant');

/**
 * Establishes a connection to MongoDB using environment variables
 * 
 * @async
 * @function connectDB
 * @returns {Promise<mongoose.Connection>} MongoDB connection object on successful connection
 * @throws {Error} Propagates any connection errors for handling by the caller
 */
const connectDB = async () => {
    try {
        // Connect to MongoDB using URI and database name from environment variables
        // Connection options are set using Mongoose defaults for the current version
        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        
        // Return the connection for potential use by the caller
        return connection;
    } catch (error) {
        // Propagate the error to be handled by the application's error handler
        throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
};

// Export the connection function to be used in the application's entry point
module.exports = connectDB;