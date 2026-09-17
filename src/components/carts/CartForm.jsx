import { useState, useEffect, useMemo } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { getProductsWithPagination } from '../../api/productApi';
import Spinner from '../ui/Spinner';

export default function CartForm({ initialData = null, onSubmit, onCancel, isSubmitting }) {
  const [userId, setUserId] = useState('');
  const [products, setProducts] = useState([{ id: '', quantity: 1 }]);
  
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProductsWithPagination(150, 0);
        setAvailableProducts(data.products || []);
      } catch (err) {
        console.error("Failed to load products for form", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setUserId(initialData.userId || '');
      if (initialData.products && initialData.products.length > 0) {
        setProducts(initialData.products.map(p => ({
          id: p.id,
          quantity: p.quantity || 1
        })));
      } else {
        setProducts([{ id: '', quantity: 1 }]);
      }
    }
  }, [initialData]);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!userId || Number(userId) <= 0 || !Number.isInteger(Number(userId))) {
      newErrors.userId = 'Valid integer User ID is required.';
    }

    const productErrors = [];
    let hasProductError = false;
    const selectedIds = new Set();

    products.forEach((p, index) => {
      const err = {};
      if (!p.id) {
        err.id = 'Please select a product.';
        hasProductError = true;
      } else {
        if (selectedIds.has(p.id)) {
          err.id = 'Duplicate product selected.';
          hasProductError = true;
        }
        selectedIds.add(p.id);
      }

      if (!p.quantity || Number(p.quantity) < 1 || !Number.isInteger(Number(p.quantity))) {
        err.quantity = 'Quantity must be a positive integer.';
        hasProductError = true;
      }

      productErrors[index] = err;
    });

    if (hasProductError) {
      newErrors.products = productErrors;
    }

    if (products.length === 0) {
      newErrors.general = 'At least one product must be added to the cart.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        userId: Number(userId),
        products: products.map(p => ({
          id: Number(p.id),
          quantity: Number(p.quantity)
        }))
      });
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
    
    // Clear specific errors on change
    if (errors.products && errors.products[index] && errors.products[index][field]) {
      const newErrors = { ...errors };
      const newProductErrors = [...newErrors.products];
      newProductErrors[index] = { ...newProductErrors[index], [field]: null };
      newErrors.products = newProductErrors;
      setErrors(newErrors);
    }
  };

  const addProductRow = () => {
    setProducts([...products, { id: '', quantity: 1 }]);
  };

  const removeProductRow = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
    
    // Cleanup errors related to the removed row
    if (errors.products) {
      const newErrors = { ...errors };
      newErrors.products = newErrors.products.filter((_, i) => i !== index);
      setErrors(newErrors);
    }
  };

  const totalItems = useMemo(() => {
    return products.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  }, [products]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User ID Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User ID *</label>
        <Input
          type="number"
          min="1"
          name="userId"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            if (errors.userId) setErrors({ ...errors, userId: null });
          }}
          error={errors.userId}
          placeholder="e.g. 5"
        />
      </div>

      {/* Products Section */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Products *</label>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Items: {totalItems}</span>
        </div>

        {errors.general && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        )}

        {products.map((item, index) => {
          const productError = errors.products?.[index] || {};
          
          return (
            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex-1 w-full">
                <select
                  value={item.id}
                  onChange={(e) => handleProductChange(index, 'id', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors duration-300 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    productError.id
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  disabled={loadingProducts}
                >
                  <option value="">
                    {loadingProducts ? 'Loading products...' : 'Select a product...'}
                  </option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} - ${Number(p.price).toFixed(2)}
                    </option>
                  ))}
                </select>
                {productError.id && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{productError.id}</p>
                )}
              </div>
              
              <div className="w-full sm:w-24">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                  error={productError.quantity}
                  placeholder="Qty"
                />
              </div>

              <div className="flex sm:block w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  onClick={() => removeProductRow(index)}
                  disabled={products.length === 1}
                  className="!py-2 !px-2.5 text-xs !bg-red-50 !text-red-600 hover:!bg-red-100 dark:!bg-red-900/30 dark:!text-red-400 dark:hover:!bg-red-900/50 shadow-sm border border-red-200 dark:border-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove product"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          onClick={addProductRow}
          className="text-sm !bg-gray-100 !text-gray-700 hover:!bg-gray-200 dark:!bg-gray-700 dark:!text-gray-200 dark:hover:!bg-gray-600 w-full flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Product
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
        <Button 
          type="button" 
          onClick={onCancel} 
          disabled={isSubmitting} 
          className="!bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || loadingProducts}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner size="w-4 h-4" />
              Saving...
            </span>
          ) : (
            'Save Cart'
          )}
        </Button>
      </div>
    </form>
  );
}
