const PRODUCTS_KEY = 'ecommerce_products';
const USERS_KEY = 'ecommerce_users';

// Helper to safely parse JSON
const safeParse = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

// --- PRODUCTS ---
export const getProducts = () => {
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (!data) return [];
  const parsed = safeParse(data);
  return Array.isArray(parsed) ? parsed : [];
};

export const saveProducts = (products) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getProductById = (id) => {
  const products = getProducts();
  return products.find(p => String(p.id) === String(id));
};

export const addProduct = (product) => {
  const products = getProducts();
  // Generate ID if not provided
  if (!product.id) {
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
    product.id = maxId + 1;
  }
  
  // Add creation timestamp if missing
  if (!product.created_at) {
    product.created_at = new Date().toISOString();
  }

  products.push(product);
  saveProducts(products);
  return product;
};

export const updateProduct = (id, updatedData) => {
  const products = getProducts();
  const index = products.findIndex(p => String(p.id) === String(id));
  if (index === -1) {
    throw new Error(`Product with ID ${id} not found`);
  }
  products[index] = { ...products[index], ...updatedData };
  saveProducts(products);
  return products[index];
};

export const deleteProduct = (id) => {
  const products = getProducts();
  const filtered = products.filter(p => String(p.id) !== String(id));
  saveProducts(filtered);
};


// --- USERS ---
export const getUsers = () => {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) return [];
  const parsed = safeParse(data);
  return Array.isArray(parsed) ? parsed : [];
};

export const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getUserById = (id) => {
  const users = getUsers();
  return users.find(u => String(u.id) === String(id));
};

export const sanitizeUser = (user) => {
  if (!user) return user;
  const { password, ...sanitized } = user;
  return sanitized;
};

export const addUser = (user) => {
  const users = getUsers();
  // Generate ID if not provided
  if (!user.id) {
    const maxId = users.reduce((max, u) => (u.id > max ? u.id : max), 0);
    user.id = maxId + 1;
  }
  
  // Add creation timestamp if missing
  if (!user.created_at) {
    user.created_at = new Date().toISOString();
  }

  // Never store password
  const sanitizedUser = sanitizeUser(user);
  
  users.push(sanitizedUser);
  saveUsers(users);
  return sanitizedUser;
};

export const updateUser = (id, updatedData) => {
  const users = getUsers();
  const index = users.findIndex(u => String(u.id) === String(id));
  if (index === -1) {
    throw new Error(`User with ID ${id} not found`);
  }
  
  // Never store password
  const sanitizedData = sanitizeUser(updatedData);

  users[index] = { ...users[index], ...sanitizedData };
  saveUsers(users);
  return users[index];
};

export const deleteUser = (id) => {
  const users = getUsers();
  const filtered = users.filter(u => String(u.id) !== String(id));
  saveUsers(filtered);
};
