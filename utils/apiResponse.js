/**
 * @fileoverview API response formatter
 * Standardizes response format across the application
 */

/**
 * Creates a standardized API response object
 */
class ApiResponse {
  /**
   * Constructs a standardized API response
   * 
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message
   * @param {any} data - Response payload data
   * @param {boolean|null} successOverride - Optional success flag override
   */
  constructor(statusCode, message = 'success', data = null, successOverride = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = successOverride !== null ? successOverride : statusCode < 400;
  }
}

module.exports = ApiResponse;
