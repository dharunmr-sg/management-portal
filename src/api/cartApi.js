import { apiClient } from './apiClient';

/**
 * Cart API Service
 * 
 * Dedicated service functions for interacting with shopping cart endpoints
 * on the DummyJSON API using the centralized apiClient wrapper.
 */

/**
 * 1. Fetch all carts from the API.
 * 
 * @returns {Promise<Object>} Object containing carts array, total, skip, limit.
 */
export async function getCarts() {
  return await apiClient('/carts');
}

/**
 * Fetch carts with pagination from the API.
 * 
 * @param {number} limit - Number of carts to return
 * @param {number} skip - Number of carts to skip
 * @returns {Promise<Object>} Object containing carts array, total, skip, limit.
 */
export async function getCartsWithPagination(limit, skip) {
  return await apiClient(`/carts?limit=${limit}&skip=${skip}`);
}

/**
 * 2. Fetch a single cart by its unique ID.
 * 
 * @param {string|number} id - Cart identifier.
 * @returns {Promise<Object>} Cart details object including products list.
 */
export async function getCartById(id) {
  return await apiClient(`/carts/${id}`);
}

/**
 * 3. Fetch all carts belonging to a specific user.
 * 
 * @param {string|number} userId - User identifier.
 * @returns {Promise<Object>} Object containing carts for the specified user.
 */
export async function getCartsByUserId(userId) {
  return await apiClient(`/carts/user/${userId}`);
}

/**
 * 4. Create a new cart.
 * 
 * @param {Object} cartData - Data for the new cart (userId, products array, etc.).
 * @returns {Promise<Object>} Created cart object returned from the API.
 */
export async function addCart(cartData) {
  return await apiClient('/carts/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cartData),
  });
}

/**
 * 5. Update an existing cart by ID.
 * 
 * @param {string|number} id - Cart identifier.
 * @param {Object} cartData - Updated cart data (products, quantities, etc.).
 * @returns {Promise<Object>} Updated cart object returned from the API.
 */
export async function updateCart(id, cartData) {
  return await apiClient(`/carts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cartData),
  });
}

/**
 * 6. Delete a cart by ID.
 * 
 * @param {string|number} id - Cart identifier to delete.
 * @returns {Promise<Object>} Deleted cart confirmation object.
 */
export async function deleteCart(id) {
  return await apiClient(`/carts/${id}`, {
    method: 'DELETE',
  });
}
