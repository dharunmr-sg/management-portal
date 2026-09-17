import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../api/orderApi';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import FilterBar from '../components/filters/FilterBar';

const PAGE_SIZE = 10;



const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Delivered': return 'success';
    case 'Shipped': return 'primary';
    case 'Processing': return 'warning';
    default: return 'gray';
  }
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders(150, 0);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, userIdFilter, statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = searchTerm === '' || String(order.id).includes(searchTerm.trim());
      const matchesUserId = userIdFilter === '' || String(order.userId) === userIdFilter.trim();
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesUserId && matchesStatus;
    });
  }, [orders, searchTerm, userIdFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setUserIdFilter('');
    setStatusFilter('All');
  };

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Summary logic (based on currently displayed/filtered orders)
  const summary = useMemo(() => {
    let totalOrderValue = 0;
    let totalDiscountedValue = 0;
    let totalItems = 0;
    
    filteredOrders.forEach(o => {
      totalOrderValue += (o.total || 0);
      totalDiscountedValue += (o.discountedTotal || 0);
      totalItems += (o.totalProducts || (o.products ? o.products.length : 0));
    });

    return {
      count: filteredOrders.length,
      totalOrderValue,
      totalDiscountedValue,
      totalItems
    };
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Search and Filters (Moved to top) */}
      <FilterBar 
        onClear={handleClearFilters} 
        showClear={searchTerm || userIdFilter || statusFilter !== 'All'}
      >
        <div className="w-full md:flex-1 md:min-w-[250px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Search Order ID
          </label>
          <Input
            type="text"
            placeholder="Order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            User ID
          </label>
          <Input
            type="text"
            placeholder="User ID"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[38px] px-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </FilterBar>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Displayed Orders</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{summary.count}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Value (Loaded)</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${summary.totalOrderValue.toFixed(2)}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discounted (Loaded)</p>
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">${summary.totalDiscountedValue.toFixed(2)}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Items (Loaded)</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{summary.totalItems}</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <Spinner />
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            Loading orders...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Unable to Load Orders</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">{error}</p>
          <Button onClick={fetchOrders} className="inline-flex items-center gap-2 text-sm">Retry Request</Button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title={orders.length === 0 ? "No orders found" : "No orders match your filters"}
          description={orders.length === 0 ? "There are currently no orders available." : "Try adjusting your search or filters to see results."}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Qty</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discounted</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {paginatedOrders.map((order) => {
                  const productsCount = order.totalProducts || (order.products ? order.products.length : 0);
                  const qtyCount = order.totalQuantity || 0;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">ORD-{order.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">User {order.userId}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{productsCount} items</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{qtyCount} units</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">${Number(order.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">${Number(order.discountedTotal || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={() => navigate(`/orders/${order.id}`)} className="!py-1.5 !px-3 text-xs !bg-blue-50 !text-blue-600 hover:!bg-blue-100 dark:!bg-blue-900/30 dark:!text-blue-400 dark:hover:!bg-blue-900/50 shadow-sm border border-blue-200 dark:border-blue-800">
                          View Details
                        </Button>
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
            totalItems={filteredOrders.length}
            pageSize={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  );
}
