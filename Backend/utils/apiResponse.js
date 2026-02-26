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
   * @param {string} message - Response message
   * @param {any} data - Response payload data
   * @param {boolean} success - Success flag (default: true)
   */
  constructor(message = 'success', data = null, success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
