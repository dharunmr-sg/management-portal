import apiClient from './apiClient';

export async function getUsers() {
  return await apiClient.get('/users');
}

export async function getUserById(id) {
  return await apiClient.get(`/users/${id}`);
}

export async function searchUsers(query) {
  return await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
}

export async function getUsersWithPagination(limit = 10, skip = 0) {
  return await apiClient.get(`/users?limit=${limit}&skip=${skip}`);
}

export async function getUsersByRole(role) {
  return await apiClient.get(`/users/filter?key=role&value=${encodeURIComponent(role)}`);
}

export async function getUsersByAge(minAge, maxAge) {
  const data = await apiClient.get(`/users?limit=200`);
  const filteredUsers = (data.users || []).filter(user => user.age >= minAge && user.age <= maxAge);
  return {
    users: filteredUsers,
    total: filteredUsers.length,
    skip: 0,
    limit: filteredUsers.length
  };
}

// Added write operations for DummyJSON mock support
export async function addUser(userData) {
  return await apiClient.post('/users/add', userData);
}

export async function updateUser(id, userData) {
  return await apiClient.put(`/users/${id}`, userData);
}

export async function deleteUser(id) {
  return await apiClient.delete(`/users/${id}`);
}
