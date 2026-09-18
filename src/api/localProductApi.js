import localApiClient from './localApiClient';

export async function getLocalProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await localApiClient.get(`/products${query ? `?${query}` : ''}`);
}

export async function getLocalProductById(id) {
  return await localApiClient.get(`/products/${id}`);
}

export async function createLocalProduct(product) {
  return await localApiClient.post('/products', product);
}

export async function updateLocalProduct(id, product) {
  return await localApiClient.put(`/products/${id}`, product);
}

export async function patchLocalProduct(id, product) {
  return await localApiClient.patch(`/products/${id}`, product);
}

export async function deleteLocalProduct(id) {
  return await localApiClient.delete(`/products/${id}`);
}
