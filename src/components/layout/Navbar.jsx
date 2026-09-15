import Button from '../ui/Button';
import { useTheme } from '../../context/ThemeContext'; // Import our teleporter!

export default function Navbar({ onMenuClick }) {
  // Reach into the teleporter and grab our state and function!
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 flex-shrink-0 transition-colors duration-300">
      <div className="w-full px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">GuideXR</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* The Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
