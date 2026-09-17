import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { getDashboardStats } from '../api/dashboardApi';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Raw API Data
  const [rawData, setRawData] = useState({
    products: [],
    totalUsersCount: 0,
    totalProductsCount: 0
  });

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [stockFilter, setStockFilter] = useState('All Statuses');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setRawData(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Helpers
  const formatCurrency = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;



  const getStockStatus = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  // Extract unique categories for the filter dropdown
  const categories = useMemo(() => {
    if (!rawData.products) return [];
    const cats = new Set(rawData.products.map(p => p.category).filter(Boolean));
    return ['All Categories', ...Array.from(cats)];
  }, [rawData.products]);

  const hasActiveFilters = categoryFilter !== 'All Categories' || stockFilter !== 'All Statuses';

  const clearFilters = () => {
    setCategoryFilter('All Categories');
    setStockFilter('All Statuses');
  };

  // --- Client Side Filtering ---
  const filteredProducts = useMemo(() => {
    return rawData.products.filter(p => {
      const matchCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
      const matchStock = stockFilter === 'All Statuses' || getStockStatus(p.stock) === stockFilter;
      return matchCategory && matchStock;
    });
  }, [rawData.products, categoryFilter, stockFilter]);

  // --- Aggregate KPIs ---
  const kpis = useMemo(() => {
    return {
      // If no filters are active, use global counts, otherwise use filtered array length
      productsCount: (categoryFilter !== 'All Categories' || stockFilter !== 'All Statuses') ? filteredProducts.length : rawData.totalProductsCount,
      usersCount: rawData.totalUsersCount, // Users aren't affected by these specific filters
    };
  }, [filteredProducts, rawData, categoryFilter, stockFilter]);

  // --- Chart Data Computations ---
  const inventoryStats = useMemo(() => {
    let inStock = 0, lowStock = 0, outOfStock = 0;
    filteredProducts.forEach(p => {
      const stock = p.stock || 0;
      if (stock === 0) outOfStock++;
      else if (stock <= 10) lowStock++;
      else inStock++;
    });
    return { inStock, lowStock, outOfStock, total: filteredProducts.length };
  }, [filteredProducts]);

  const categoryDistribution = useMemo(() => {
    const counts = {};
    filteredProducts.forEach(p => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    // Convert to sorted array
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6
  }, [filteredProducts]);



  const topProductsList = useMemo(() => {
    return [...filteredProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  }, [filteredProducts]);

  // --- Rendering ---
  if (loading && !rawData.products.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner />
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Loading comprehensive analytics...</p>
      </div>
    );
  }

  if (error && !rawData.products.length) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Analytics Unavailable</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">{error}</p>
        <Button onClick={fetchDashboardData} className="inline-flex items-center gap-2 text-sm">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      
      {/* 1. Page Header & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Centralized insights for your platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchDashboardData} 
            disabled={loading}
            className="flex items-center gap-2 text-sm !px-4 !bg-white hover:!bg-gray-50 text-gray-700 border border-gray-300 dark:!bg-gray-800 dark:hover:!bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Spinner size="w-3 h-3 border-2" /> Refreshing...</span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Data
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 px-4 py-3 rounded-lg text-sm flex items-start sm:items-center gap-3">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>This dashboard utilizes DummyJSON mock data. Some analytics are mathematically calculated for demonstration purposes.</p>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { title: 'Total Products', value: kpis.productsCount.toLocaleString(), color: 'text-gray-900 dark:text-white' },
          { title: 'Total Users', value: kpis.usersCount.toLocaleString(), color: 'text-gray-900 dark:text-white' }
        ].map((kpi, idx) => (
          <Card key={idx} className="p-3 sm:p-4 flex flex-col justify-center">
            <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{kpi.title}</h3>
            <span className={`text-lg sm:text-xl md:text-2xl font-bold truncate ${kpi.color}`} title={kpi.value}>
              {kpi.value}
            </span>
          </Card>
        ))}
      </div>

      {/* 3. Filters */}
      <Card className="p-3.5 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Product Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Inventory Status */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Inventory Status
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="flex items-center self-start sm:self-end">
            {hasActiveFilters && (
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-300"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Inventory Overview */}
        <Card className="p-4 sm:p-5 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Inventory Overview</h2>
              <p className="text-xs text-gray-500 mt-0.5">Distribution based on current filters</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {inventoryStats.total === 0 ? (
              <p className="text-sm text-center text-gray-500">No inventory matches filters.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 flex flex-col items-center text-center">
                  <p className="text-xs font-medium text-green-600 dark:text-green-500 uppercase tracking-wider mb-2">In Stock</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">{inventoryStats.inStock}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex flex-col items-center text-center">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2">Low Stock</p>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{inventoryStats.lowStock}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex flex-col items-center text-center">
                  <p className="text-xs font-medium text-red-600 dark:text-red-500 uppercase tracking-wider mb-2">Out of Stock</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-400">{inventoryStats.outOfStock}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Category Distribution Chart */}
        <Card className="p-4 sm:p-5 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Category Density</h2>
              <p className="text-xs text-gray-500 mt-0.5">Top mapped categories</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-3.5">
            {categoryDistribution.length === 0 ? (
              <p className="text-sm text-center text-gray-500">No categories match filters.</p>
            ) : (
              categoryDistribution.map((cat, idx) => {
                const percentage = ((cat.count / inventoryStats.total) * 100).toFixed(1);
                // Assign distinct colors based on index
                const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
                const color = colors[idx % colors.length];
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between text-xs sm:text-sm font-medium mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{cat.name}</span>
                      <span className="text-gray-900 dark:text-white">{cat.count} <span className="text-gray-500 font-normal ml-1">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-2.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

      </div>

      {/* 5. Tables Row (Product Overview) */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Top Products */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Product Overview</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Top Rated items matching filters</p>
            </div>
            <Link to="/products" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View Catalog
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {topProductsList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No products match filters.</td>
                  </tr>
                ) : (
                  topProductsList.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {product.thumbnail && (
                          <img src={product.thumbnail} alt={product.title} className="w-6 h-6 rounded object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[140px]">{product.title}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{product.stock}</td>
                      <td className="px-4 py-3 text-sm text-amber-500 dark:text-amber-400 font-medium flex items-center gap-1">
                        ★ {product.rating}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </div>
  );
}
