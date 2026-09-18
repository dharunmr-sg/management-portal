import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHeaderContext } from '../context/HeaderContext';
import { useDataSource } from '../context/DataSourceContext';
import { getUnifiedProductById } from '../api/unifiedProductApi';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';

// Helper component for label-value display
const DetailRow = ({ label, value }) => {
  const isEmpty = value === null || value === undefined || value === '';
  if (isEmpty) return null;
  return (
    <div className="flex flex-col sm:flex-row py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 gap-1 sm:gap-4">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{value}</span>
    </div>
  );
};

export default function ProductDetails() {
  const { id } = useParams();
  const { dataSource } = useDataSource();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUnifiedProductById(dataSource, id);
        setProduct(data);
        // Set initial image
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        } else if (data.thumbnail) {
          setSelectedImage(data.thumbnail);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, dataSource]);

  const { setHeaderContent } = useHeaderContext();

  useEffect(() => {
    if (product && !loading && !error) {
      setHeaderContent(
        <div className="flex items-center text-lg md:text-xl font-bold text-gray-900 dark:text-white flex-wrap gap-2">
          <Link to="/products" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors whitespace-nowrap">
            Products
          </Link>
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
          <span className="truncate">
            {product.title}
          </span>
        </div>
      );
    }
    return () => setHeaderContent(null);
  }, [product, loading, error, setHeaderContent]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-8 space-y-6">
        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
          <Link to="/products" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">
            Products
          </Link>
          <span className="mx-2 text-gray-400 dark:text-gray-600">/</span>
          <span className="text-gray-400 dark:text-gray-500">Loading...</span>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner />
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto pb-8 space-y-6">
        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
          <Link to="/products" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">
            Products
          </Link>
          <span className="mx-2 text-gray-400 dark:text-gray-600">/</span>
          <span className="text-gray-400 dark:text-gray-500">Not Found</span>
        </div>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error || "The product you are looking for does not exist."}
          </p>
          <Link 
            to="/products" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            &larr; Return to Products
          </Link>
        </div>
      </div>
    );
  }

  // Calculate discounted price safely
  let discountedPrice = product.price;
  if (product.price && product.discountPercentage) {
    discountedPrice = product.price - (product.price * (product.discountPercentage / 100));
  }

  const getAvailabilityColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in stock': return 'success';
      case 'low stock': return 'warning';
      case 'out of stock': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-8 space-y-6">
      
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="primary" className="capitalize">{product.category || 'Uncategorized'}</Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">Brand: <span className="font-medium text-gray-900 dark:text-white">{product.brand || 'Generic'}</span></span>
          </div>
        </div>
        <div>
          <Badge variant={getAvailabilityColor(product.availabilityStatus)}>
            {product.availabilityStatus || (product.stock > 0 ? 'In Stock' : 'Out of Stock')}
          </Badge>
        </div>
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Image Gallery */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
          {/* Main Image */}
          <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
            {selectedImage ? (
              <img src={selectedImage} alt={product.title} className="w-full h-full object-contain" />
            ) : (
              <div className="text-gray-400 font-medium">No Image Available</div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-md border-2 overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === img 
                      ? 'border-blue-500 shadow-md scale-105' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover bg-gray-50 dark:bg-gray-900" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Pricing */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Pricing</h3>
            <div className="flex items-end gap-4 flex-wrap">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ${Number(discountedPrice).toFixed(2)}
              </span>
              {product.discountPercentage > 0 && (
                <>
                  <span className="text-xl text-gray-400 dark:text-gray-500 line-through mb-1">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <Badge variant="danger" className="mb-2 h-6 flex items-center">
                    -{product.discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Core Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Product Specifications</h3>
            <div className="space-y-1">
              <DetailRow label="Description" value={product.description} />
              <DetailRow label="SKU" value={product.sku} />
              <DetailRow label="Rating" value={`${product.rating || 'No rating'} / 5.0`} />
              <DetailRow label="Stock Remaining" value={product.stock} />
              <DetailRow label="Weight" value={product.weight ? `${product.weight} oz` : null} />
              <DetailRow label="Min. Order Qty" value={product.minimumOrderQuantity} />
              
              {/* Dimensions safely extracted */}
              {product.dimensions && (
                <DetailRow 
                  label="Dimensions" 
                  value={`${product.dimensions.width}W x ${product.dimensions.height}H x ${product.dimensions.depth}D cm`} 
                />
              )}
            </div>
          </div>

          {/* Fulfillment & Policies */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Fulfillment & Policies</h3>
            <div className="space-y-1">
              <DetailRow label="Shipping Info" value={product.shippingInformation} />
              <DetailRow label="Warranty" value={product.warrantyInformation} />
              <DetailRow label="Return Policy" value={product.returnPolicy} />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Reviews</h3>
        </div>
        <div className="p-5 sm:p-6">
          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{review.reviewerName || 'Anonymous'}</span>
                    <div className="flex items-center text-xs font-semibold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                      <svg className="w-3 h-3 fill-current mr-1" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {review.rating}/5
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{review.comment}"</p>
                  {review.date && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center italic py-4">No reviews available for this product.</p>
          )}
        </div>
      </div>
    </div>
  );
}
