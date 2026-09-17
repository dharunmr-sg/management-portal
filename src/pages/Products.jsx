import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsWithPagination, searchProducts, addProduct, updateProduct, deleteProduct } from '../api/productApi';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/products/ProductForm';
import Pagination from '../components/ui/Pagination';
import FilterBar from '../components/filters/FilterBar';
import FilterSelect from '../components/filters/FilterSelect';
import useDebounce from '../hooks/useDebounce';

const PAGE_SIZE = 12;

export default function Products() {
  const navigate = useNavigate();
  // Core state management for API data, status
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // CRUD Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProductItem, setEditProductItem] = useState(null);
  const [deleteProductItem, setDeleteProductItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Fetch a large batch of products from DummyJSON to allow robust client-side filtering.
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (debouncedSearchTerm) {
        const data = await searchProducts(debouncedSearchTerm);
        setProducts(data.products || []);
      } else {
        // Fetch up to 150 products so client-side filters have enough data to work with
        const data = await getProductsWithPagination(150, 0);
        setProducts(data.products || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm]);

  // Trigger API fetch whenever search query changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, stockFilter, priceFilter, ratingFilter]);

  // Dynamic Categories from payload
  const uniqueCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [products]);

  // Client-Side Filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Category
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;

      // 2. Stock
      const stock = p.stock || 0;
      if (stockFilter === 'In Stock' && stock <= 10) return false;
      if (stockFilter === 'Low Stock' && (stock === 0 || stock > 10)) return false;
      if (stockFilter === 'Out of Stock' && stock > 0) return false;

      // 3. Price
      const price = p.price || 0;
      if (priceFilter === 'Under $50' && price >= 50) return false;
      if (priceFilter === '$50 - $100' && (price < 50 || price > 100)) return false;
      if (priceFilter === 'Over $100' && price <= 100) return false;

      // 4. Rating
      const rating = p.rating || 0;
      if (ratingFilter === '4.5 & up' && rating < 4.5) return false;
      if (ratingFilter === '4.0 & up' && rating < 4.0) return false;
      if (ratingFilter === '3.0 & up' && rating < 3.0) return false;

      return true;
    });
  }, [products, categoryFilter, stockFilter, priceFilter, ratingFilter]);

  // Client-Side Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'All' || stockFilter !== 'All' || priceFilter !== 'All' || ratingFilter !== 'All';

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStockFilter('All');
    setPriceFilter('All');
    setRatingFilter('All');
  };

  // CRUD Handlers
  const handleAddSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const newProduct = await addProduct(data);
      setProducts(prev => [newProduct, ...prev]);
      showToast('Product added successfully!', 'success');
      setIsAddModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to add product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const updatedProduct = await updateProduct(editProductItem.id, data);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      showToast('Product updated successfully!', 'success');
      setEditProductItem(null);
    } catch (err) {
      showToast(err.message || 'Failed to update product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await deleteProduct(deleteProductItem.id);
      setProducts(prev => prev.filter(p => p.id !== deleteProductItem.id));
      showToast('Product deleted successfully!', 'success');
      setDeleteProductItem(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for category badge styling
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
      {/* Filter Bar */}
      <FilterBar
        onClear={handleClearFilters}
        showClear={hasActiveFilters}
        actionButton={
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 text-sm !px-4 h-[38px]">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Button>
        }
      >
        <div className="w-full md:flex-1 md:min-w-[250px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Search
          </label>
          <Input
            placeholder="Search by name, brand, keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>
        <FilterSelect
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={uniqueCategories}
          defaultLabel="All Categories"
        />
        <FilterSelect
          label="Inventory Status"
          value={stockFilter}
          onChange={setStockFilter}
          options={["In Stock", "Low Stock", "Out of Stock"]}
          defaultLabel="All Statuses"
        />
        <FilterSelect
          label="Price Range"
          value={priceFilter}
          onChange={setPriceFilter}
          options={["Under $50", "$50 - $100", "Over $100"]}
          defaultLabel="All Prices"
        />
        <FilterSelect
          label="Rating"
          value={ratingFilter}
          onChange={setRatingFilter}
          options={["4.5 & up", "4.0 & up", "3.0 & up"]}
          defaultLabel="All Ratings"
        />
      </FilterBar>

      {/* Content Area: Loading / Error / Empty / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <Spinner />
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            Loading products from API...
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Request
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No products match your filters"
          description="Try adjusting your search criteria or resetting filters to see results."
        >
          {hasActiveFilters && (
            <Button onClick={handleClearFilters} className="text-xs !py-1.5 !px-3">
              Clear All Filters
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
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
                    Rating
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {paginatedProducts.map((product) => {
                  const imageSrc = product.thumbnail || (product.images && product.images[0]);
                  return (
                    <tr
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      title="Click to view details"
                    >
                      {/* ID */}
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                        #{product.id}
                      </td>

                      {/* Product Thumbnail + Title */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={product.title}
                              className="h-10 w-10 rounded-md object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex-shrink-0 group-hover:opacity-80 transition-opacity"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                              N/A
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs sm:max-w-sm">
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

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Badge variant={getCategoryVariant(product.category)}>
                          {product.category}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        ${Number(product.price).toFixed(2)}
                      </td>

                      {/* Stock */}
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

                      {/* Rating */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center text-xs font-semibold text-amber-500 dark:text-amber-400">
                          <svg className="w-4 h-4 fill-current mr-1" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{product.rating}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${product.id}`);
                            }}
                            className="!py-1 !px-2.5 text-xs !bg-blue-50 !text-blue-600 hover:!bg-blue-100 dark:!bg-blue-900/30 dark:!text-blue-400 dark:hover:!bg-blue-900/50 shadow-sm border border-blue-200 dark:border-blue-800"
                          >
                            View
                          </Button>
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
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isLoading={loading}
            totalItems={filteredProducts.length}
            pageSize={PAGE_SIZE}
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

    </div>
  );
}
