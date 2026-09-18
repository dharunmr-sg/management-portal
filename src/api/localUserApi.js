import localApiClient from './localApiClient';

export async function getLocalUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await localApiClient.get(`/users${query ? `?${query}` : ''}`);
}

export async function getLocalUserById(id) {
  return await localApiClient.get(`/users/${id}`);
}

export async function createLocalUser(user) {
  return await localApiClient.post('/users', user);
}

export async function updateLocalUser(id, user) {
  return await localApiClient.put(`/users/${id}`, user);
}

export async function patchLocalUser(id, user) {
  return await localApiClient.patch(`/users/${id}`, user);
}

export async function deleteLocalUser(id) {
  return await localApiClient.delete(`/users/${id}`);
}
