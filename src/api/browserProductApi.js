import { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from '../services/localStorageService';

// Simulate async network request
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export async function getBrowserProducts(queryParams = {}) {
  await delay();
  
  const { page = 1, limit = 10, search, category, availability_status, sortBy = 'id', order = 'desc' } = queryParams;
  let products = getProducts();

  // Filter
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }
  if (category) {
    products = products.filter(p => p.category === category);
  }
  if (availability_status) {
    products = products.filter(p => p.availabilityStatus === availability_status);
  }

  // Sort
  if (sortBy) {
    products.sort((a, b) => {
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
  const total = products.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedProducts = products.slice(offset, offset + limit);

  return {
    success: true,
    data: paginatedProducts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages
    }
  };
}

export async function getBrowserProductById(id) {
  await delay();
  const product = getProductById(id);
  if (!product) {
    throw new Error(`Product with ID ${id} not found`);
  }
  return { success: true, data: product };
}

export async function createBrowserProduct(productData) {
  await delay();
  const newProduct = addProduct(productData);
  return { success: true, data: newProduct };
}

export async function updateBrowserProduct(id, productData) {
  await delay();
  const updated = updateProduct(id, productData);
  return { success: true, data: updated };
}

export async function deleteBrowserProduct(id) {
  await delay();
  deleteProduct(id);
  return { success: true };
}
