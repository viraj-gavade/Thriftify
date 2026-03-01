import axios from 'axios';

// Get the API base URL from environment or fallback
const getBaseURL = () => {
  // In production with separate backend/frontend on Render
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In development with Vite proxy
  return '';
};

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default api;

// Export the base API URL for socket connections
// Use this when initializing Socket.io client
export const getSocketUrl = () => {
  // If VITE_API_URL is set (production), use it for socket connection
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In development, use same origin (Vite proxy handles it)
  return window.location.origin;
};
