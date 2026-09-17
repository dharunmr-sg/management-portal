import { getProductsWithPagination } from './productApi';
import { getUsersWithPagination } from './userApi';

/**
 * Fetches data needed for the Dashboard, returning raw arrays 
 * so the client can filter and aggregate them dynamically.
 * 
 * @returns {Promise<Object>} Object containing raw products and users.
 */
export async function getDashboardStats() {
  const [productsRes, usersRes] = await Promise.all([
    getProductsWithPagination(150, 0),
    getUsersWithPagination(1, 0) // Just need total user count
  ]);

  return {
    products: productsRes.products || [],
    totalUsersCount: usersRes.total || 0,
    totalProductsCount: productsRes.total || 0,
  };
}
