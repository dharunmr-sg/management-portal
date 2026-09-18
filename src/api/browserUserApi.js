import { 
  getUsers, 
  getUserById, 
  addUser, 
  updateUser, 
  deleteUser 
} from '../services/localStorageService';

// Simulate async network request
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export async function getBrowserUsers(queryParams = {}) {
  await delay();
  
  const { page = 1, limit = 10, search, role, gender, sortBy = 'id', order = 'desc' } = queryParams;
  let users = getUsers();

  // Filter
  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u => 
      u.first_name?.toLowerCase().includes(q) || 
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
    );
  }
  if (role) {
    users = users.filter(u => u.role === role);
  }
  if (gender) {
    users = users.filter(u => u.gender === gender);
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
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages
    }
  };
}

export async function getBrowserUserById(id) {
  await delay();
  const user = getUserById(id);
  if (!user) {
    throw new Error(`User with ID ${id} not found`);
  }
  return { success: true, data: user };
}

export async function createBrowserUser(userData) {
  await delay();
  const newUser = addUser(userData);
  return { success: true, data: newUser };
}

export async function updateBrowserUser(id, userData) {
  await delay();
  const updated = updateUser(id, userData);
  return { success: true, data: updated };
}

export async function deleteBrowserUser(id) {
  await delay();
  deleteUser(id);
  return { success: true };
}
