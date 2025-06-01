import axios from 'axios';

// Define the base URL for your Laravel backend
const baseURL = 'http://localhost:8000'; // Ensure this matches your backend URL

// Create an Axios instance with default configurations
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Important for Sanctum to work with cookies (CSRF, session)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Function to get the CSRF token from cookies.
 * Sanctum sets a cookie named XSRF-TOKEN.
 * @returns {string|null} The CSRF token or null if not found.
 */
const getCSRFToken = () => {
  const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

// Request interceptor to add Authorization token and CSRF token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add Authorization token (Bearer token for API requests)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For non-GET requests, ensure CSRF token is present.
    // Sanctum's EnsureFrontendRequestsAreStateful middleware handles CSRF for SPA stateful requests,
    // but it's good practice to include X-XSRF-TOKEN for POST/PUT/DELETE if your setup requires it explicitly.
    // The /sanctum/csrf-cookie endpoint sets the XSRF-TOKEN cookie. Axios automatically sends this cookie
    // and sets the X-XSRF-TOKEN header if withCredentials is true and the cookie is present for the domain.
    // Explicitly setting it can be a fallback or if specific configurations demand it.
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      } else {
        // Attempt to fetch a new CSRF token if not found (e.g., initial load or cookie expired)
        // This is usually handled by initializeCSRF on app load.
        // console.warn('CSRF token not found in cookies for a mutating request.');
        // You might consider calling initializeCSRF here as a last resort, but it's better to ensure it's set on app load.
      }
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors like 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response, // Simply return successful responses
  async (error) => {
    const originalRequest = error.config;

    // Handle 419 CSRF token mismatch/expiration
    // This typically means the XSRF-TOKEN cookie was missing or invalid.
    // Sanctum's middleware usually handles this by redirecting or returning a 419.
    // For SPAs, you might want to re-fetch the CSRF cookie and retry.
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark to prevent infinite retry loops
      try {
        await initializeCSRF(); // Re-fetch the CSRF cookie
        // Retry the original request with the new CSRF token (Axios should pick it up automatically from cookie)
        return axiosInstance(originalRequest);
      } catch (csrfError) {
        console.error('Failed to refresh CSRF token and retry request:', csrfError);
        // Could redirect to login or show a global error
        // For now, just reject the promise
        return Promise.reject(csrfError);
      }
    }

    // Handle 401 (Unauthorized) errors - typically means token is invalid or expired
    if (error.response?.status === 401 && !originalRequest._retryAuth) {
      originalRequest._retryAuth = true; // Avoid retry loops for auth
      console.error('Authentication Error (401): Token might be invalid or expired.');
      // Clear stored credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      // Check if already on login page to avoid loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // For other errors, just pass them along
    return Promise.reject(error);
  }
);

/**
 * Function to initialize the CSRF token by making a request to Sanctum's endpoint.
 * This should be called once when the application loads.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export const initializeCSRF = async () => {
  try {
    // Use axiosInstance to ensure baseURL and withCredentials are applied
    await axiosInstance.get('/sanctum/csrf-cookie');
    console.log('CSRF cookie initialized successfully.');
    return true;
  } catch (error) {
    console.error('Failed to initialize CSRF token:', error.response?.data || error.message);
    return false;
  }
};

export default axiosInstance;