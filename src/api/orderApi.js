import apiClient from './apiClient';

/**
 * Helper to determine a mock order status based on ID
 */
const getSimulatedStatus = (orderId) => {
  if (!orderId) return 'Pending';
  if (orderId % 4 === 0) return 'Delivered';
  if (orderId % 3 === 0) return 'Shipped';
  if (orderId % 2 === 0) return 'Processing';
  return 'Pending';
};

/**
 * Fetch a paginated list of orders (using DummyJSON carts endpoint as a mock for orders)
 */
export async function getOrders(limit = 10, skip = 0) {
  const data = await apiClient.get(`/carts?limit=${limit}&skip=${skip}`);
  
  const mappedOrders = (data.carts || []).map(cart => ({
    ...cart,
    status: getSimulatedStatus(cart.id)
  }));

  return {
    orders: mappedOrders,
    total: data.total || 0,
    skip: data.skip || 0,
    limit: data.limit || 0
  };
}

/**
 * Fetch a single order by its ID
 */
export async function getOrderById(id) {
  const data = await apiClient.get(`/carts/${id}`);
  return {
    ...data,
    status: getSimulatedStatus(data.id)
  };
}

/**
 * Create a new order
 */
export async function createOrder(orderData) {
  return await apiClient.post('/carts/add', orderData);
}

/**
 * Update an order's status
 */
export async function updateOrderStatus(id, status) {
  // Note: DummyJSON doesn't officially support 'status' on carts, 
  // but it echoes back PUT payload for simulation purposes.
  return await apiClient.put(`/carts/${id}`, { status });
}
