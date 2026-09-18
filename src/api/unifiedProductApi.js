import { getProducts as getRemoteProducts, addProduct as addRemoteProduct, updateProduct as updateRemoteProduct, deleteProduct as deleteRemoteProduct, getProductsWithPagination } from './productApi';
import { getLocalProducts, getLocalProductById, createLocalProduct, updateLocalProduct, deleteLocalProduct } from './localProductApi';
import { getBrowserProducts, getBrowserProductById, createBrowserProduct, updateBrowserProduct, deleteBrowserProduct } from './browserProductApi';

/**
 * Unified adapter that routes requests to either the external API or the local SQLite database.
 */



export async function getUnifiedProducts(source, queryParams = {}) {
  const { page = 1, limit = 10, search, category, availability_status, sortBy = 'id', order = 'desc' } = queryParams;

  if (source === 'local') {
    const data = await getLocalProducts(queryParams);
    return data; // returns { data: [...], pagination: {...} } from our Express backend
  } else if (source === 'browser') {
    return await getBrowserProducts(queryParams);
  } else {
    // For DummyJSON, fetch a larger batch and do client-side filtering/sorting
    const response = await getProductsWithPagination(200, 0); // max is usually enough for a demo mock
    let products = response.products || [];

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
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}

export async function getUnifiedProductById(source, id) {
  if (source === 'local') {
    const data = await getLocalProductById(id);
    return data; // localApiClient already unpacks json.data
  } else if (source === 'browser') {
    const data = await getBrowserProductById(id);
    return data.data;
  } else {
    // getProductById is available in productApi
    const { getProductById } = await import('./productApi');
    return await getProductById(id);
  }
}

export async function createUnifiedProduct(source, productData) {
  if (source === 'local') {
    return await createLocalProduct(productData);
  } else if (source === 'browser') {
    return await createBrowserProduct(productData);
  } else {
    // Note: DummyJSON's /add endpoint simulates adding a product but does not persist it.
    return await addRemoteProduct(productData);
  }
}

export async function updateUnifiedProduct(source, id, productData) {
  if (source === 'local') {
    return await updateLocalProduct(id, productData);
  } else if (source === 'browser') {
    return await updateBrowserProduct(id, productData);
  } else {
    // DummyJSON /update simulates update
    return await updateRemoteProduct(id, productData);
  }
}

export async function deleteUnifiedProduct(source, id) {
  if (source === 'local') {
    return await deleteLocalProduct(id);
  } else if (source === 'browser') {
    return await deleteBrowserProduct(id);
  } else {
    // DummyJSON /delete simulates delete
    return await deleteRemoteProduct(id);
  }
}

export async function bulkDeleteUnifiedProducts(source, ids) {
  if (source === 'local') {
    // Optional: Add bulk delete endpoint to express, or delete iteratively
    const promises = ids.map(id => deleteLocalProduct(id));
    await Promise.all(promises);
    return { success: true };
  } else if (source === 'browser') {
    const promises = ids.map(id => deleteBrowserProduct(id));
    await Promise.all(promises);
    return { success: true };
  } else {
    const promises = ids.map(id => deleteUnifiedProduct(source, id));
    return await Promise.all(promises);
  }
}
