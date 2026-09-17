import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartsWithPagination, addCart, updateCart, deleteCart } from '../api/cartApi';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import FilterBar from '../components/filters/FilterBar';
import CartForm from '../components/carts/CartForm';

const PAGE_SIZE = 10;

export default function Carts() {
  const navigate = useNavigate();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [minAmountFilter, setMinAmountFilter] = useState('All Amounts');
  const [minProductsFilter, setMinProductsFilter] = useState('All Products');

  // CRUD States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCart, setSelectedCart] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const { showToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cartToDelete, setCartToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCarts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCartsWithPagination(150, 0);
      setCarts(data.carts || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch carts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setUserIdFilter('');
    setMinAmountFilter('All Amounts');
    setMinProductsFilter('All Products');
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, userIdFilter, minAmountFilter, minProductsFilter]);

  const filteredCarts = carts.filter((cart) => {
    const matchesSearch = searchTerm === '' || String(cart.id).includes(searchTerm.trim());
    const matchesUserId = userIdFilter === '' || String(cart.userId) === userIdFilter.trim();
    
    // Amount Filter
    let matchesAmount = true;
    const totalAmount = cart.total || 0;
    if (minAmountFilter === 'Over $50' && totalAmount <= 50) matchesAmount = false;
    if (minAmountFilter === 'Over $100' && totalAmount <= 100) matchesAmount = false;
    if (minAmountFilter === 'Over $500' && totalAmount <= 500) matchesAmount = false;

    // Products Count Filter
    let matchesProducts = true;
    const totalProductsCount = cart.totalProducts || 0;
    if (minProductsFilter === '3+ Products' && totalProductsCount < 3) matchesProducts = false;
    if (minProductsFilter === '5+ Products' && totalProductsCount < 5) matchesProducts = false;

    return matchesSearch && matchesUserId && matchesAmount && matchesProducts;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCarts.length / PAGE_SIZE));
  const paginatedCarts = filteredCarts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedCart(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cart) => {
    setModalMode('edit');
    setSelectedCart(cart);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (cart) => {
    setCartToDelete(cart);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (cartData) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        const newCart = await addCart(cartData);
        setCarts((prev) => [newCart, ...prev]);
        showToast('Cart successfully created!', 'success');
      } else {
        const updatedCart = await updateCart(selectedCart.id, cartData);
        setCarts((prev) => prev.map(c => c.id === selectedCart.id ? updatedCart : c));
        showToast('Cart successfully updated!', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!cartToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCart(cartToDelete.id);
      setCarts((prev) => prev.filter(c => c.id !== cartToDelete.id));
      showToast('Cart successfully deleted!', 'success');
      setIsDeleteModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to delete cart.', 'error');
    } finally {
      setIsDeleting(false);
      setCartToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <FilterBar 
        onClear={handleClearFilters} 
        showClear={searchTerm !== '' || userIdFilter !== '' || minAmountFilter !== 'All Amounts' || minProductsFilter !== 'All Products'}
        actionButton={
          <Button onClick={openAddModal} className="text-sm !py-2 !px-4 h-[38px]">
            + Add Cart
          </Button>
        }
      >
        <div className="w-full md:flex-1 md:min-w-[250px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Search by Cart ID
          </label>
          <Input
            type="text"
            placeholder="Search cart ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            User ID
          </label>
          <Input
            type="text"
            placeholder="Enter user ID"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Min Amount
          </label>
          <select
            value={minAmountFilter}
            onChange={(e) => setMinAmountFilter(e.target.value)}
            className="w-full h-[38px] px-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm dark:text-white"
          >
            <option value="All Amounts">All Amounts</option>
            <option value="Over $50">Over $50</option>
            <option value="Over $100">Over $100</option>
            <option value="Over $500">Over $500</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Min Products
          </label>
          <select
            value={minProductsFilter}
            onChange={(e) => setMinProductsFilter(e.target.value)}
            className="w-full h-[38px] px-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm dark:text-white"
          >
            <option value="All Products">All Products</option>
            <option value="3+ Products">3+ Products</option>
            <option value="5+ Products">5+ Products</option>
          </select>
        </div>
      </FilterBar>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <Spinner />
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            Loading carts from API...
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
            Unable to Load Carts
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
            {error}
          </p>
          <Button onClick={fetchCarts} className="inline-flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Request
          </Button>
        </div>
      ) : carts.length === 0 ? (
        <EmptyState
          title="No carts found"
          description="There are currently no carts available."
        />
      ) : filteredCarts.length === 0 ? (
        <EmptyState
          title="No carts match your search or filter"
          description="Try adjusting your Cart ID or User ID filter to see results."
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cart ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Products
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Qty
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Discounted Total
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {paginatedCarts.map((cart) => (
                  <tr
                    key={cart.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                      #{cart.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      User {cart.userId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {cart.totalProducts} items
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {cart.totalQuantity} units
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ${Number(cart.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                      ${Number(cart.discountedTotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => openEditModal(cart)} className="!py-1.5 !px-2.5 text-xs !bg-gray-100 !text-gray-700 hover:!bg-gray-200 dark:!bg-gray-700 dark:!text-gray-200 dark:hover:!bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600">
                          Edit
                        </Button>
                        <Button onClick={() => openDeleteModal(cart)} className="!py-1.5 !px-2.5 text-xs !bg-red-50 !text-red-600 hover:!bg-red-100 dark:!bg-red-900/30 dark:!text-red-400 dark:hover:!bg-red-900/50 shadow-sm border border-red-200 dark:border-red-800">
                          Delete
                        </Button>
                        <Button onClick={() => navigate(`/carts/${cart.id}`)} className="!py-1.5 !px-3 text-xs !bg-blue-50 !text-blue-600 hover:!bg-blue-100 dark:!bg-blue-900/30 dark:!text-blue-400 dark:hover:!bg-blue-900/50 shadow-sm border border-blue-200 dark:border-blue-800">
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isLoading={loading}
            totalItems={filteredCarts.length}
            pageSize={PAGE_SIZE}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === 'add' ? 'Add New Cart' : 'Edit Cart'}
        size="md"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
          </div>
        )}
        <CartForm
          initialData={selectedCart}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this cart? This action cannot be undone.
          </p>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="!bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="!bg-red-600 hover:!bg-red-700 dark:!bg-red-500 dark:hover:!bg-red-600 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
