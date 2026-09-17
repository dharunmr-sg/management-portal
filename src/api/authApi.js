import apiClient from './apiClient';

/**
 * Auth API Service
 * 
 * Provides authentication-related API calls to DummyJSON.
 */

/**
 * 1. Log in a user.
 * 
 * @param {Object} credentials - The user's login credentials.
 * @param {string} credentials.username - The username.
 * @param {string} credentials.password - The password.
 * @returns {Promise<Object>} The API response containing user details and tokens.
 */
export async function loginUser(credentials) {
  return await apiClient.post('/user/login', credentials);
}
