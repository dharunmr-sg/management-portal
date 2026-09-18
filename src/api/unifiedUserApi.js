import { getUsers as getRemoteUsers, addUser as addRemoteUser, updateUser as updateRemoteUser, deleteUser as deleteRemoteUser } from './userApi';
import { 
  getLocalUsers, 
  getLocalUserById,
  createLocalUser, 
  updateLocalUser, 
  deleteLocalUser 
} from './localUserApi';
import { 
  getBrowserUsers, 
  getBrowserUserById, 
  createBrowserUser, 
  updateBrowserUser, 
  deleteBrowserUser 
} from './browserUserApi';

/**
 * Unified adapter that routes requests to either the external API or the local SQLite database.
 */

import { getUsersWithPagination } from './userApi';

export async function getUnifiedUsers(source, queryParams = {}) {
  const { page = 1, limit = 10, search, role, gender, sortBy = 'id', order = 'desc' } = queryParams;

  if (source === 'local') {
    const data = await getLocalUsers(queryParams);
    return data; // returns { data: [...], pagination: {...} } from our Express backend
  } else if (source === 'browser') {
    return await getBrowserUsers(queryParams);
  } else {
    // For DummyJSON, fetch a larger batch and do client-side filtering/sorting
    const response = await getUsersWithPagination(200, 0);
    let users = response.users || [];

    // Filter
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => 
        u.firstName?.toLowerCase().includes(q) || 
        u.lastName?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    if (role) {
      users = users.filter(u => u.role === role);
    }
    if (gender) {
      users = users.filter(u => u.gender?.toLowerCase() === gender.toLowerCase());
    }

    // Sort
    if (sortBy) {
      users.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Paginate
    const total = users.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedUsers = users.slice(offset, offset + limit);

    return {
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}

export async function getUnifiedUserById(source, id) {
  if (source === 'local') {
    const data = await getLocalUserById(id);
    return data;
  } else if (source === 'browser') {
    const data = await getBrowserUserById(id);
    return data.data;
  } else {
    const { getUserById } = await import('./userApi');
    return await getUserById(id);
  }
}

export async function createUnifiedUser(source, userData) {
  if (source === 'local') {
    return await createLocalUser(userData);
  } else if (source === 'browser') {
    return await createBrowserUser(userData);
  } else {
    // DummyJSON's /add endpoint simulates adding a user but does not persist it.
    return await addRemoteUser(userData);
  }
}

export async function updateUnifiedUser(source, id, userData) {
  if (source === 'local') {
    return await updateLocalUser(id, userData);
  } else if (source === 'browser') {
    return await updateBrowserUser(id, userData);
  } else {
    // DummyJSON simulates update
    return await updateRemoteUser(id, userData);
  }
}

export async function deleteUnifiedUser(source, id) {
  if (source === 'local') {
    return await deleteLocalUser(id);
  } else if (source === 'browser') {
    return await deleteBrowserUser(id);
  } else {
    // DummyJSON simulates delete
    return await deleteRemoteUser(id);
  }
}

export async function bulkDeleteUnifiedUsers(source, ids) {
  if (source === 'local') {
    // Optional: Add bulk delete endpoint to express, or delete iteratively
    const promises = ids.map(id => deleteLocalUser(id));
    await Promise.all(promises);
    return { success: true };
  } else if (source === 'browser') {
    const promises = ids.map(id => deleteBrowserUser(id));
    await Promise.all(promises);
    return { success: true };
  } else {
    // DummyJSON doesn't support bulk delete, simulate it
    const promises = ids.map(id => deleteRemoteUser(id));
    await Promise.all(promises);
    return { success: true };
  }
}
