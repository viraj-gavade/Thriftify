/**
 * @fileoverview Custom API error handler
 * Provides standardized error responses across the application
 */

/**
 * Creates a standardized API error with proper status code and details
 * @extends Error
 */
class CustomApiError extends Error {
  /**
   * Constructs a standardized API error
   * 
   * @param {number} statusCode - HTTP status code for the error
   * @param {string} message - Error message
   * @param {Array} errors - Additional error details
   * @param {string} stack - Optional stack trace
   */
  constructor(
    statusCode,
    message = 'Something Went Wrong!',
    errors = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = null;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = CustomApiError;