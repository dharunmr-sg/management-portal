import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  // Determine initial desktop/tablet collapsed state
  const [isCollapsed, setIsCollapsedState] = useState(() => {
    try {
      const saved = localStorage.getItem('guidexr_sidebar_collapsed');
      if (saved !== null) {
        return saved === 'true';
      }
      // If no preference saved, tablet screens (768px - 1023px) start collapsed, desktop (>=1024px) starts expanded
      if (typeof window !== 'undefined') {
        return window.innerWidth >= 768 && window.innerWidth < 1024;
      }
    } catch {
      // Fallback
    }
    return false;
  });

  // Mobile drawer state (< 768px)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Set collapsed and persist to localStorage
  const setIsCollapsed = (value) => {
    setIsCollapsedState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem('guidexr_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  // Close mobile drawer automatically when viewport is resized to tablet or desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleCollapse,
        isMobileOpen,
        setIsMobileOpen,
        openMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
