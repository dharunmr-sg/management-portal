import { apiClient } from './apiClient';

/**
 * Product API Service
 * 
 * Provides dedicated functions for interacting with product endpoints
 * on the DummyJSON API via the centralized apiClient.
 */

/**
 * 1. Fetch all products (default page from API).
 * 
 * @returns {Promise<Object>} Object containing products array, total, skip, limit.
 */
export async function getProducts() {
  return await apiClient('/products');
}

/**
 * 2. Fetch a single product by its unique ID.
 * 
 * @param {string|number} id - Product identifier.
 * @returns {Promise<Object>} Detailed product object.
 */
export async function getProductById(id) {
  return await apiClient(`/products/${id}`);
}

/**
 * 3. Search products by a search keyword.
 * 
 * @param {string} query - Keyword or phrase to search for.
 * @returns {Promise<Object>} Object containing matching products.
 */
export async function searchProducts(query) {
  const encodedQuery = encodeURIComponent(query);
  return await apiClient(`/products/search?q=${encodedQuery}`);
}

/**
 * 4. Fetch the full list of available product category names.
 * 
 * @returns {Promise<Array<string>>} Array of category name strings.
 */
export async function getProductCategories() {
  return await apiClient('/products/category-list');
}

/**
 * 5. Fetch all products belonging to a specific category.
 * 
 * @param {string} category - Category slug or name.
 * @returns {Promise<Object>} Object containing products in the category.
 */
export async function getProductsByCategory(category) {
  const encodedCategory = encodeURIComponent(category);
  return await apiClient(`/products/category/${encodedCategory}`);
}

/**
 * 6. Fetch products with pagination parameters (limit & skip).
 * 
 * @param {number} [limit=12] - Number of items per page.
 * @param {number} [skip=0] - Number of items to skip for offset pagination.
 * @returns {Promise<Object>} Paginated products response.
 */
export async function getProductsWithPagination(limit = 12, skip = 0) {
  return await apiClient(`/products?limit=${limit}&skip=${skip}`);
}

/**
 * 7. Fetch products sorted by a specific field in ascending or descending order.
 * 
 * @param {string} sortBy - Field to sort by (e.g. 'title', 'price', 'rating').
 * @param {string} [order="asc"] - Sort direction ('asc' or 'desc').
 * @returns {Promise<Object>} Sorted products response.
 */
export async function getProductsSorted(sortBy, order = "asc") {
  return await apiClient(`/products?sortBy=${sortBy}&order=${order}`);
}
