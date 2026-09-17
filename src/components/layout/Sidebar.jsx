import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen: propIsOpen, onClose: propOnClose }) {
  const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isMobileOpen;
  const handleClose = propOnClose || closeMobile;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    handleClose(); // Close sidebar on mobile
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      to: '/products',
      label: 'Products',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      to: '/orders',
      label: 'Orders',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      to: '/users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      to: '/organizations',
      label: 'Organizations',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Backdrop: visible when drawer is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container - Sticky on desktop/tablet to always anchor bottom toggle button in view */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-[width,transform] duration-300 ease-in-out flex flex-col md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0 overflow-visible flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'w-64 md:w-[72px]' : 'w-64 md:w-64'
        }`}
      >
        {/* Mobile Header (Close button & Logo) */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">GuideXR</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-2.5 flex-1 overflow-x-hidden overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.to} className="relative group">
                <NavLink
                  to={item.to}
                  onClick={handleClose}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isCollapsed ? 'md:justify-center md:px-0 px-3' : 'px-3'
                    } py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                        : 'text-gray-600 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`
                  }
                >
                  {item.icon}
                  <span
                    className={`whitespace-nowrap transition-all duration-200 ${
                      isCollapsed ? 'md:hidden ml-3' : 'ml-3'
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>

                {/* Floating Tooltip when Collapsed on Desktop/Tablet */}
                {isCollapsed && (
                  <div
                    role="tooltip"
                    className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none items-center"
                  >
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                    <span className="relative z-10">{item.label}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* User Profile & Logout Section */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? 'md:justify-center md:px-0 px-3' : 'px-3'
            } py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group relative`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span
              className={`whitespace-nowrap transition-all duration-200 ${
                isCollapsed ? 'md:hidden ml-3' : 'ml-3'
              }`}
            >
              Sign out ({user?.username || 'Account'})
            </span>

            {/* Floating Tooltip when Collapsed on Desktop/Tablet */}
            {isCollapsed && (
              <div
                role="tooltip"
                className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none items-center"
              >
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                <span className="relative z-10">Sign out</span>
              </div>
            )}
          </button>
        </div>

        {/* Bottom-Aligned Collapse/Expand Control */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-2.5 flex-shrink-0 hidden md:block">
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? 'Expand sidebar' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'
            } text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group relative`}
          >
            <div className="flex items-center gap-2.5">
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {!isCollapsed && (
                <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">
                  Collapse sidebar
                </span>
              )}
            </div>

            {/* Tooltip for Bottom Toggle when Collapsed */}
            {isCollapsed && (
              <div
                role="tooltip"
                className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none items-center"
              >
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                <span className="relative z-10">Expand sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
