import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnifiedProducts, createUnifiedProduct, updateUnifiedProduct, deleteUnifiedProduct, bulkDeleteUnifiedProducts } from '../api/unifiedProductApi';
import { importProductsCSV } from '../api/importApi';
import { useDataSource } from '../context/DataSourceContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ProductForm from '../components/products/ProductForm';
import CsvImportModal from '../components/import/CsvImportModal';

// Helper custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Products() {
  const navigate = useNavigate();
  const { dataSource } = useDataSource();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editProductItem, setEditProductItem] = useState(null);
  const [deleteProductItem, setDeleteProductItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    availability_status: '',
    sortBy: 'id',
    order: 'desc'
  });
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, totalPages: 1 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    setQuery(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Reset query on data source change
  useEffect(() => {
    setQuery({ page: 1, limit: 10, search: '', category: '', availability_status: '', sortBy: 'id', order: 'desc' });
    setSearchInput('');
    setSelectedIds(new Set());
  }, [dataSource]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUnifiedProducts(dataSource, query);
      // Depending on source, it could be the raw array or an object
      if (response && response.data) {
        setProducts(response.data);
        setPaginationInfo(response.pagination || { total: 0, totalPages: 1 });
      } else if (Array.isArray(response)) {
        setProducts(response);
        setPaginationInfo({ total: response.length, totalPages: 1 });
      } else {
        setProducts([]);
        setPaginationInfo({ total: 0, totalPages: 1 });
      }
      setSelectedIds(new Set());
    } catch (err) {
      if (dataSource === 'local') {
        setError('Unable to connect to the local database server. Please make sure the backend is running.');
      } else {
        setError(err.message || 'Failed to fetch products from external API.');
      }
    } finally {
      setLoading(false);
    }
  }, [dataSource, query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createUnifiedProduct(dataSource, data);
      
      if (dataSource === 'api') {
        showToast('Product added successfully! (Mock API: Changes will not persist)', 'success');
      } else {
        showToast('Product added successfully!', 'success');
      }
      setIsAddModalOpen(false);
      fetchProducts(); // Refresh list to get pagination correct
    } catch (err) {
      showToast(err.message || 'Failed to add product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await updateUnifiedProduct(dataSource, editProductItem.id, data);
      
      if (dataSource === 'api') {
        showToast('Product updated successfully! (Mock API: Changes will not persist)', 'success');
      } else {
        showToast('Product updated successfully!', 'success');
      }
      setEditProductItem(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to update product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await deleteUnifiedProduct(dataSource, deleteProductItem.id);
      
      if (dataSource === 'api') {
        showToast('Product deleted successfully! (Mock API: Changes will not persist)', 'success');
      } else {
        showToast('Product deleted successfully!', 'success');
      }
      setDeleteProductItem(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setIsBulkDeleting(true);
    try {
      await bulkDeleteUnifiedProducts(dataSource, Array.from(selectedIds));
      if (dataSource === 'api') {
        showToast('Products deleted successfully! (Mock API)', 'success');
      } else {
        showToast('Products deleted successfully!', 'success');
      }
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to delete products.', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length && products.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getCategoryVariant = (category) => {
    const categoryLower = (category || '').toLowerCase();
    if (categoryLower.includes('beauty')) return 'warning';
    if (categoryLower.includes('fragrance')) return 'brand';
    if (categoryLower.includes('grocer')) return 'success';
    if (categoryLower.includes('furnitur')) return 'neutral';
    return 'brand';
  };

  return (
    <div className="space-y-6 relative">


      {/* Action Row */}
      <div className="flex items-center gap-4">
        {/* Filter Bar */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 overflow-x-auto">
          <div className="w-64 flex-shrink-0 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm dark:text-white"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <div className="flex-1 flex items-center gap-3 justify-end min-w-max">
            <select
              value={query.category}
              onChange={(e) => setQuery(p => ({ ...p, category: e.target.value, page: 1 }))}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="beauty">Beauty</option>
              <option value="fragrances">Fragrances</option>
              <option value="furniture">Furniture</option>
              <option value="groceries">Groceries</option>
              <option value="laptops">Laptops</option>
              <option value="smartphones">Smartphones</option>
              <option value="skincare">Skincare</option>
            </select>
            <select
              value={query.availability_status}
              onChange={(e) => setQuery(p => ({ ...p, availability_status: e.target.value, page: 1 }))}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <select
              value={query.sortBy}
              onChange={(e) => setQuery(p => ({ ...p, sortBy: e.target.value }))}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="id">Sort by ID</option>
              <option value="title">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
            <select
              value={query.order}
              onChange={(e) => setQuery(p => ({ ...p, order: e.target.value }))}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Buttons — only in Local DB mode */}
        {dataSource === 'local' && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 text-sm h-10 px-3 !bg-emerald-600 hover:!bg-emerald-700 dark:!bg-emerald-600 dark:hover:!bg-emerald-700"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="whitespace-nowrap">Import CSV</span>
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 text-sm h-10 px-3"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="whitespace-nowrap">Add Product</span>
            </Button>
          </div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-lg flex items-center justify-between border border-blue-100 dark:border-blue-800/50">
          <span className="text-sm font-medium">{selectedIds.size} products selected</span>
          <Button
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="!py-1 !px-3 text-xs !bg-red-100 !text-red-700 hover:!bg-red-200 dark:!bg-red-900/40 dark:!text-red-400 border-none shadow-none"
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <Spinner />
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            {dataSource === 'local' ? 'Loading products from local backend...' : 'Loading products from external API...'}
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Unable to Load Products
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
            {error}
          </p>
          <Button onClick={fetchProducts} className="inline-flex items-center gap-2 text-sm">
            Retry Request
          </Button>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title={searchInput ? "No products match your search" : "No products found"}
          description={searchInput ? "Try adjusting your filters or search term." : "There are no products to display yet."}
        >
          {!searchInput && (
            <Button onClick={() => setIsAddModalOpen(true)} className="text-xs !py-1.5 !px-3">
              Add Your First Product
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      checked={selectedIds.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th scope="col" className="w-16 px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {products.map((product) => {
                  const imageSrc = product.thumbnail || (product.images && product.images[0]);
                  const isSelected = selectedIds.has(product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelectOne(product.id)}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                        #{product.id}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={product.title}
                              className="h-10 w-10 rounded-md object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                              N/A
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-blue-600 dark:text-blue-400 truncate max-w-xs sm:max-w-sm">
                              {product.title}
                            </span>
                            {product.brand && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {product.brand}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Badge variant={getCategoryVariant(product.category)}>
                          {product.category || 'N/A'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        ${Number(product.price).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.stock > 10
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : product.stock > 0
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                          {product.stock > 0 ? (product.stock <= 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock'}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditProductItem(product);
                            }}
                            className="!py-1 !px-2.5 text-xs !bg-gray-100 !text-gray-700 hover:!bg-gray-200 dark:!bg-gray-700 dark:!text-gray-200 dark:hover:!bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteProductItem(product);
                            }}
                            className="!py-1 !px-2.5 text-xs !bg-red-50 !text-red-600 hover:!bg-red-100 dark:!bg-red-900/30 dark:!text-red-400 dark:hover:!bg-red-900/50 shadow-sm border border-red-200 dark:border-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={query.page}
            totalPages={paginationInfo.totalPages}
            totalItems={paginationInfo.total}
            pageSize={query.limit}
            onPageChange={(page) => setQuery(p => ({ ...p, page }))}
          />
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        title="Add New Product"
        size="lg"
      >
        <ProductForm
          onSubmit={handleAddSubmit}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={!!editProductItem}
        onClose={() => !isSubmitting && setEditProductItem(null)}
        title="Edit Product"
        size="lg"
      >
        {editProductItem && (
          <ProductForm
            initialData={editProductItem}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditProductItem(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteProductItem}
        onClose={() => !isSubmitting && setDeleteProductItem(null)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{deleteProductItem?.title}</span>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setDeleteProductItem(null)}
              disabled={isSubmitting}
              className="!bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Product'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => !isBulkDeleting && setIsBulkDeleteModalOpen(false)}
        title="Delete Multiple Products"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{selectedIds.size}</span> products?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setIsBulkDeleteModalOpen(false)}
              disabled={isBulkDeleting}
              className="!bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkDeleteConfirm}
              disabled={isBulkDeleting}
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete Products'}
            </Button>
          </div>
        </div>
      </Modal>
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importProductsCSV}
        entityName="Products"
        onSuccess={fetchProducts}
      />

    </div>
  );
}
