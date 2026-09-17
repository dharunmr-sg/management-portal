import apiClient from './apiClient';

/**
 * Fetch all users (default pagination limit is 30 in DummyJSON).
 */
export async function getUsers() {
  return await apiClient.get('/users');
}

/**
 * Fetch a user by their ID.
 */
export async function getUserById(id) {
  return await apiClient.get(`/users/${id}`);
}

/**
 * Search users by a query string.
 */
export async function searchUsers(query) {
  return await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
}

/**
 * Fetch users with limit and skip parameters.
 */
export async function getUsersWithPagination(limit = 10, skip = 0) {
  return await apiClient.get(`/users?limit=${limit}&skip=${skip}`);
}

/**
 * Filter users by role.
 */
export async function getUsersByRole(role) {
  return await apiClient.get(`/users/filter?key=role&value=${encodeURIComponent(role)}`);
}

/**
 * Filter users by age (Mock implementation).
 */
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
