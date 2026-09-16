import { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// 1. Create the Teleporter (Context)
const ThemeContext = createContext();

// 2. Create the Provider (the machine that powers the teleporter)
export function ThemeProvider({ children }) {
  const [storedTheme, setStoredTheme] = useLocalStorage('theme-preference', 'system');

  // Normalize storedTheme (handle boolean values from previous version)
  const themeMode = typeof storedTheme === 'boolean'
    ? (storedTheme ? 'dark' : 'light')
    : (storedTheme || 'system');

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (e) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', updateSystemTheme);
    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  const isDarkMode = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const setThemeMode = (mode) => {
    setStoredTheme(mode);
  };

  const toggleTheme = () => {
    setStoredTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, themeMode, setThemeMode }}>
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
