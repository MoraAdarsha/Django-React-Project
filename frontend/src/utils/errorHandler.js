/**
 * Extract user-friendly error message from Axios error
 * @param {Error} error - Axios error object
 * @param {string} defaultMessage - Fallback message
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error, defaultMessage = "Something went wrong. Please try again.") => {
    // Network error
    if (!error.response) {
        return "Unable to connect to server. Please check your connection.";
    }

    // Extract backend error messages
    const { data, status } = error.response;

    // Handle specific status codes
    if (status === 401) {
        return "Invalid credentials. Please try again.";
    }

    if (status === 404) {
        return "Resource not found.";
    }

    if (status === 500) {
        return "Server error. Please try again later.";
    }

    // Parse backend error messages
    if (data) {
        // Handle array of errors
        if (Array.isArray(data)) {
            return data[0] || defaultMessage;
        }

        // Handle object with error fields
        if (typeof data === 'object') {
            // Common Django REST Framework error formats
            if (data.detail) {
                return data.detail;
            }

            if (data.username) {
                return Array.isArray(data.username) ? data.username[0] : data.username;
            }

            if (data.password) {
                return Array.isArray(data.password) ? data.password[0] : data.password;
            }

            if (data.non_field_errors) {
                return Array.isArray(data.non_field_errors) 
                    ? data.non_field_errors[0] 
                    : data.non_field_errors;
            }

            // Get first error message from any field
            const firstKey = Object.keys(data)[0];
            if (firstKey && data[firstKey]) {
                const errorValue = data[firstKey];
                return Array.isArray(errorValue) ? errorValue[0] : errorValue;
            }
        }

        // If data is a string
        if (typeof data === 'string') {
            return data;
        }
    }

    return defaultMessage;
};

/**
 * Get user-friendly error message for authentication errors
 * @param {Error} error - Axios error object
 * @param {string} action - 'login' or 'register'
 * @returns {string} - User-friendly error message
 */
export const getAuthErrorMessage = (error, action = 'login') => {
    if (!error.response) {
        return "Unable to connect to server. Please check your connection.";
    }

    const { data, status } = error.response;
    
    // Debug: Log what we're receiving from backend
    console.log('Login Error Debug:', { status, data, detail: data?.detail });

    // Login specific errors
    // Error mapping based on status codes and backend response:
    // Backend now returns specific error messages:
    // - "User not found" → username doesn't exist
    // - "Password is incorrect" → wrong password
    if (action === 'login') {
        // Check for 401 unauthorized errors
        if (status === 401) {
            const detail = data?.detail || '';
            const detailLower = typeof detail === 'string' ? detail.toLowerCase() : '';
            
            console.log('Checking detail message:', detailLower);
            
            // Check for "User not found" message from backend
            if (detailLower.includes('user not found') || (detailLower.includes('user') && detailLower.includes('not found'))) {
                return "Account doesn't exist";
            }
            
            // Check for "Password is incorrect" message from backend
            if (detailLower.includes('password is incorrect') || (detailLower.includes('password') && detailLower.includes('incorrect'))) {
                return "Password is incorrect";
            }
            
            // Fallback for any other 401 error
            return "Invalid credentials";
        }
        
        // 404 typically means resource not found
        if (status === 404) {
            return "Account doesn't exist";
        }
    }

    // Register specific errors
    if (action === 'register') {
        if (status === 400) {
            if (data?.username) {
                const usernameError = Array.isArray(data.username) ? data.username[0] : data.username;
                if (usernameError.toLowerCase().includes('already exists') || 
                    usernameError.toLowerCase().includes('taken')) {
                    return "Username already exists. Please choose a different username.";
                }
                return usernameError;
            }

            if (data?.password) {
                const passwordError = Array.isArray(data.password) ? data.password[0] : data.password;
                return passwordError;
            }
        }
    }

    // Fallback to generic error handler
    return getErrorMessage(error);
};
