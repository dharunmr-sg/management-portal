import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Overlay: visible when menu is open, clicking it closes the menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex-shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </p>
          <ul className="mt-4 space-y-2">
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30" 
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30" 
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`
                }
              >
                Analytics
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/users" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30" 
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`
                }
              >
                Users
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/organizations" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30" 
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`
                }
              >
                Organizations
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30" 
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`
                }
              >
                Settings
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
