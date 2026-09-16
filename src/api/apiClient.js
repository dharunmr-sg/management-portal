/**
 * Global API Client
 * 
 * A reusable, centralized fetch wrapper for interacting with remote REST APIs.
 * Currently configured with DummyJSON as the base API URL.
 */

// Base URL for the DummyJSON API
const BASE_URL = 'https://dummyjson.com';

/**
 * Perform an HTTP request to the API.
 * 
 * @param {string} endpoint - The API endpoint path (e.g. '/products' or 'products/1')
 * @param {RequestInit} [options={}] - Standard fetch configuration options (method, headers, body, etc.)
 * @returns {Promise<any>} Parsed JSON response data
 * @throws {Error} Throws a descriptive error when request fails or returns non-2xx status
 */
export async function apiClient(endpoint, options = {}) {
  // Ensure endpoint begins with a leading slash for clean URL concatenation
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${formattedEndpoint}`;

  // Default headers merged with custom headers provided in options
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    method: 'GET',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // If a request body is passed as an object, serialize it to JSON
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Execute the network request using native fetch
  const response = await fetch(url, config);

  // Check if response status is in the successful 200-299 range
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status} (${response.statusText})`;

    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Fall back to HTTP status message if response body is not JSON
    }

    throw new Error(errorMessage);
  }

  // Gracefully handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  // Parse and return the JSON response payload
  return await response.json();
}
