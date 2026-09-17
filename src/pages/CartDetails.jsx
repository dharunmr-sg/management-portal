import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHeaderContext } from '../context/HeaderContext';
import { getCartById } from '../api/cartApi';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

export default function CartDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCartDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCartById(id);
      setCart(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch cart details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCartDetails();
  }, [fetchCartDetails]);

  const { setHeaderContent } = useHeaderContext();

  useEffect(() => {
    if (cart && !loading && !error) {
      setHeaderContent(
        <div className="flex items-center text-lg md:text-xl font-bold text-gray-900 dark:text-white flex-wrap gap-2">
          <Link to="/carts" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors whitespace-nowrap">
            Carts
          </Link>
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
          <span className="truncate">
            Cart #{cart.id} Details
          </span>
        </div>
      );
    }
    return () => setHeaderContent(null);
  }, [cart, loading, error, setHeaderContent]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <Spinner />
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading cart details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Unable to Load Cart
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
          {error}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => navigate('/carts')} className="!bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200">
            Back to Carts
          </Button>
          <Button onClick={fetchCartDetails}>
            Retry Request
          </Button>
        </div>
      </div>
    );
  }

  if (!cart) return null;

  const savings = cart.total - cart.discountedTotal;

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              User #{cart.userId}
            </p>
          </div>
        </div>
      </div>

      {/* Cart Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{cart.totalProducts}</p>
          <p className="text-xs text-gray-500 mt-1">{cart.totalQuantity} units</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Original Total</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            ${Number(cart.total).toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Discounted Total</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
            ${Number(cart.discountedTotal).toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Savings</p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">
            ${Math.max(0, savings).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Cart Items
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                  ID
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Qty
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Discount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {cart.products && cart.products.length > 0 ? (
                cart.products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                      #{product.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-10 w-10 rounded-md object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                            N/A
                          </div>
                        )}
                        <span className="block text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs sm:max-w-sm">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      x{product.quantity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 line-through">
                      ${Number(product.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          ${Number(product.discountedTotal).toFixed(2)}
                        </span>
                        {product.discountPercentage && (
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                            (-{Number(product.discountPercentage).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No products found in this cart.
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
