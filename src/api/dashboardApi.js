import { getProductsWithPagination } from './productApi';
import { getUsersWithPagination } from './userApi';
import { getCartsWithPagination } from './cartApi';

/**
 * Fetches data needed for the Dashboard, returning raw arrays 
 * so the client can filter and aggregate them dynamically.
 * 
 * @returns {Promise<Object>} Object containing raw products, users, and carts.
 */
export async function getDashboardStats() {
  const [productsRes, usersRes, cartsRes] = await Promise.all([
    getProductsWithPagination(150, 0),
    getUsersWithPagination(1, 0), // Just need total user count
    getCartsWithPagination(100, 0)
  ]);

  return {
    products: productsRes.products || [],
    carts: cartsRes.carts || [],
    totalUsersCount: usersRes.total || 0,
    totalProductsCount: productsRes.total || 0,
    totalOrdersCount: cartsRes.total || 0,
  };
}
