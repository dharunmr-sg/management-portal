import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { useProductContext } from '../../context/ProductContext';
import { useHeaderContext } from '../../context/HeaderContext';

const getPageTitle = (pathname) => {
  if (pathname === '/' || pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname === '/users') return 'Users';
  if (pathname.startsWith('/users/')) return 'User Details';
  if (pathname === '/organizations') return 'Organizations';
  if (pathname.startsWith('/organizations/')) return 'Organization Details';
  if (pathname === '/settings' || pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/analytics')) return 'Dashboard';
  if (pathname.startsWith('/products')) return 'Products';
  if (pathname.startsWith('/carts')) return 'Active Carts';
  if (pathname.startsWith('/orders')) return 'Orders Dashboard';
  return 'Dashboard';
};

export default function Navbar({ onMenuClick }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isCollapsed, openMobile } = useSidebar();
  const { selectedProduct, setSelectedProduct } = useProductContext();
  const { headerContent } = useHeaderContext();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  const handleMobileClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      openMobile();
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 flex-shrink-0 transition-colors duration-300 ease-in-out">
      <div className="flex items-center h-14 w-full">
        {/* Brand section: matches sidebar width (w-64 on desktop when expanded, w-[72px] when collapsed) */}
        <div
          className={`w-auto flex-shrink-0 flex items-center h-full transition-[width] duration-300 ease-in-out md:border-r md:border-gray-200 md:dark:border-gray-700 ${
            isCollapsed ? 'md:w-[72px] px-3 md:justify-center' : 'md:w-64 px-4 md:px-6 justify-between'
          }`}
        >
          {/* Mobile menu button */}
          <button
            onClick={handleMobileClick}
            aria-label="Open mobile navigation"
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-base shadow-sm">
              G
            </div>
            <span
              className={`text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight transition-all duration-200 whitespace-nowrap ${
                isCollapsed ? 'md:hidden' : 'inline'
              }`}
            >
              GuideXR
            </span>
          </div>
        </div>

        {/* Content header section: positioned exactly above the main content area */}
        <div className="flex-1 flex items-center justify-between px-4 sm:px-5 md:px-6 max-w-7xl mx-auto w-full h-full">
          <div className="flex items-center min-w-0">
            {headerContent ? (
              headerContent
            ) : location.pathname === '/products' && selectedProduct ? (
              <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800 animate-fade-in truncate">
                {selectedProduct.thumbnail ? (
                  <img 
                    src={selectedProduct.thumbnail} 
                    alt={selectedProduct.title} 
                    className="w-6 h-6 rounded-full object-cover mr-2 bg-white dark:bg-gray-800"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-2 text-[10px] font-bold text-blue-600 dark:text-blue-300">
                    {selectedProduct.title.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate mr-2">
                  {selectedProduct.title}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mr-3 hidden sm:inline">
                  ${Number(selectedProduct.price).toFixed(2)}
                </span>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors flex-shrink-0"
                  aria-label="Clear selected product"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 truncate">
                {pageTitle}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0 ml-4">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="group p-2 rounded-full text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Toggle Dark Mode"
              aria-label="Toggle Dark Mode"
            >
              <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
                <svg 
                  className={`absolute w-6 h-6 transform transition-all duration-300 ease-in-out ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg 
                  className={`absolute w-6 h-6 transform transition-all duration-300 ease-in-out ${isDarkMode ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
