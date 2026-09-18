import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ProductForm({ initialData = null, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    discount_percentage: '',
    stock: '',
    rating: '',
    thumbnail: '',
    sku: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        brand: initialData.brand || '',
        price: initialData.price !== undefined ? initialData.price : '',
        discount_percentage: initialData.discount_percentage !== undefined ? initialData.discount_percentage : '',
        stock: initialData.stock !== undefined ? initialData.stock : '',
        rating: initialData.rating !== undefined ? initialData.rating : '',
        thumbnail: initialData.thumbnail || '',
        sku: initialData.sku || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title?.trim()) newErrors.title = 'Title is required.';
    if (!formData.description?.trim()) newErrors.description = 'Description is required.';
    if (!formData.category?.trim()) newErrors.category = 'Category is required.';
    
    if (formData.price !== '' && Number(formData.price) < 0) {
      newErrors.price = 'Price must be 0 or greater.';
    } else if (formData.price === '') {
      newErrors.price = 'Price is required.';
    }

    if (formData.discount_percentage !== '') {
      const disc = Number(formData.discount_percentage);
      if (disc < 0 || disc > 100) newErrors.discount_percentage = 'Must be between 0 and 100.';
    }

    if (formData.stock !== '') {
      const st = Number(formData.stock);
      if (st < 0 || !Number.isInteger(st)) newErrors.stock = 'Must be a whole number >= 0.';
    } else if (formData.stock === '') {
      newErrors.stock = 'Stock is required.';
    }

    if (formData.rating !== '') {
      const r = Number(formData.rating);
      if (r < 0 || r > 5) newErrors.rating = 'Must be between 0 and 5.';
    }

    if (formData.thumbnail && !/^https?:\/\/.+/.test(formData.thumbnail)) {
      newErrors.thumbnail = 'Must be a valid URL.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Clean up string values to numbers
      const submissionData = {
        ...formData,
        price: Number(formData.price),
        discount_percentage: formData.discount_percentage ? Number(formData.discount_percentage) : 0,
        stock: Number(formData.stock),
        rating: formData.rating ? Number(formData.rating) : 0
      };
      onSubmit(submissionData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Title *</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g. iPhone 15 Pro"
          />
        </div>

        {/* Category & Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
          <Input
            name="category"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            placeholder="e.g. smartphones"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
          <Input
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g. Apple"
          />
        </div>

        {/* Price & Discount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($) *</label>
          <Input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount (%)</label>
          <Input
            type="number"
            step="0.01"
            name="discount_percentage"
            value={formData.discount_percentage}
            onChange={handleChange}
            error={errors.discount_percentage}
            placeholder="0 - 100"
          />
        </div>

        {/* Stock & Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Level *</label>
          <Input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            error={errors.stock}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating (0-5)</label>
          <Input
            type="number"
            step="0.1"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            error={errors.rating}
            placeholder="4.5"
          />
        </div>

        {/* SKU & Thumbnail URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
          <Input
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            error={errors.sku}
            placeholder="e.g. APP-IPH-15P"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
          <Input
            type="url"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            error={errors.thumbnail}
            placeholder="https://..."
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors duration-300 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
              errors.description
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder="Detailed description..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" onClick={onCancel} disabled={isSubmitting} className="!bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
}
