import { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage'; // Import our new hook!

// 1. Create the Teleporter (Context)
const ThemeContext = createContext();

// 2. Create the Provider (the machine that powers the teleporter)
export function ThemeProvider({ children }) {
  // We swapped useState out for our custom hook!
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme-preference', false);

  // Apply the dark class to the HTML tag so Tailwind works flawlessly globally!
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // A helper function to switch the theme
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // We place our state and functions inside the teleporter's "value"
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Create a custom hook so other components can easily reach into the teleporter!
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
