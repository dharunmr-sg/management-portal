import { useState, useEffect, useCallback } from 'react';
import { getProductsWithPagination, searchProducts } from '../api/productApi';
import { useProductContext } from '../context/ProductContext';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const PAGE_SIZE = 12;

export default function Products() {
  // Core state management for API data, status, and pagination
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedProduct, setSelectedProduct } = useProductContext();

  // Search input state and submitted query state
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  /**
   * Fetch products from DummyJSON using the productApi module.
   * Switches between searchProducts and getProductsWithPagination based on activeSearch.
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeSearch.trim()) {
        // Fetch search results
        const data = await searchProducts(activeSearch.trim());
        setProducts(data.products || []);
        setTotal(data.total || (data.products ? data.products.length : 0));
      } else {
        // Fetch paginated products
        const skip = (currentPage - 1) * PAGE_SIZE;
        const data = await getProductsWithPagination(PAGE_SIZE, skip);
        setProducts(data.products || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeSearch]);

  // Trigger API fetch whenever page or active search changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchInput.trim());
  };

  // Clear search and reset to first paginated page
  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
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
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Input
              type="text"
              name="search"
              placeholder="Search products by title, category, or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onClear={searchInput ? handleClearSearch : undefined}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button type="submit" className="w-full sm:w-auto text-sm !py-2 !px-4">
              Search
            </Button>
            {activeSearch && (
              <Button
                type="button"
                onClick={handleClearSearch}
                className="w-full sm:w-auto text-sm !py-2 !px-4 !bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200"
              >
                Clear
              </Button>
            )}
          </div>
        </form>

        {activeSearch && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span>Filtering by query:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              "{activeSearch}"
            </span>
            <span>({total} results found)</span>
          </div>
        )}
      </div>

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
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            activeSearch
              ? `No products matched "${activeSearch}". Try searching with different keywords.`
              : 'There are currently no products available.'
          }
        >
          {activeSearch && (
            <Button onClick={handleClearSearch} className="text-xs !py-1.5 !px-3">
              Clear Search Filter
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {products.map((product) => {
                  const imageSrc = product.thumbnail || (product.images && product.images[0]);

                  return (
                    <tr
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`cursor-pointer transition-colors ${selectedProduct?.id === product.id
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
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
                              className="h-10 w-10 rounded-md object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                              N/A
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs sm:max-w-sm">
                              {product.title}
                            </span>
                            {product.brand && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
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
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.stock > 20
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : product.stock > 0
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination Controls */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + PAGE_SIZE, total)} of {total} products
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="!py-1.5 !px-3 text-xs !bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200"
                >
                  Previous
                </Button>
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 px-1">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className="!py-1.5 !px-3 text-xs !bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
