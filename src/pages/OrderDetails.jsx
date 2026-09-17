import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHeaderContext } from '../context/HeaderContext';
import { getOrderById } from '../api/orderApi';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';



const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Delivered': return 'success';
    case 'Shipped': return 'primary';
    case 'Processing': return 'warning';
    default: return 'gray';
  }
};

export default function OrderDetails() {
  const { id } = useParams();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const { setHeaderContent } = useHeaderContext();

  useEffect(() => {
    if (order && !loading && !error) {
      setHeaderContent(
        <div className="flex items-center text-lg md:text-xl font-bold text-gray-900 dark:text-white flex-wrap gap-2">
          <Link to="/orders" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors whitespace-nowrap">
            Orders
          </Link>
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
          <span className="truncate">
            Order #ORD-{order.id}
          </span>
        </div>
      );
    }
    return () => setHeaderContent(null);
  }, [order, loading, error, setHeaderContent]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center">
        <Spinner />
        <p className="mt-4 text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {error || "The order you are looking for does not exist."}
        </p>
        <Link 
          to="/orders" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          &larr; Return to Orders
        </Link>
      </div>
    );
  }

  const productsCount = order.totalProducts || (order.products ? order.products.length : 0);
  const qtyCount = order.totalQuantity || 0;

  return (
    <div className="max-w-6xl mx-auto pb-6">
      {/* Header Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 border-b-0 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              Assigned to User ID: {order.userId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Status:</span>
            <Badge variant={getStatusBadgeColor(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-x border-gray-200 dark:border-gray-700 p-5 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Products</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{productsCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Units</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{qtyCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">${Number(order.total || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Discounted Amount</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">${Number(order.discountedTotal || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Items</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Final Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {order.products && order.products.length > 0 ? (
                order.products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{product.title || `Product #${product.id}`}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">ID: {product.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                      ${Number(product.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                      {product.quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                      ${Number(product.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-500 dark:text-red-400">
                      {product.discountPercentage ? `-${product.discountPercentage}%` : '0%'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600 dark:text-green-400">
                      ${Number(product.discountedTotal || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No items found for this order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
