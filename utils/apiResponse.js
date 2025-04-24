class ApiResponse {
    constructor(statusCode, message = 'success', data, successOverride = null) {
        // Initialize the class properties based on the parameters
        this.statusCode = statusCode;   // The HTTP status code (e.g., 200, 400, 500)
        this.message = message;         // The response message (defaults to 'success')
        this.data = data;               // The actual data to be sent in the response (e.g., user data, result)

        // If `successOverride` is provided, use that. Otherwise, default to statusCode logic.
    }
}


module.exports = ApiResponse;
