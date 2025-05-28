/**
 * @fileoverview Async handler utility for Express routes
 * Eliminates need for try/catch blocks in route handlers
 */

/**
 * Wraps an async Express route handler to automatically catch errors
 * and pass them to Express error handling middleware
 * 
 * @param {Function} fn - Async Express route handler function
 * @returns {Function} Wrapped handler that forwards errors to next()
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch((err) => next(err));
  };
};

module.exports = asyncHandler;
