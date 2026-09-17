import { createContext, useContext, useState } from 'react';

const HeaderContext = createContext();

export function HeaderProvider({ children }) {
  const [headerContent, setHeaderContent] = useState(null);

  return (
    <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContext() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeaderContext must be used within a HeaderProvider');
  }
  return context;
}
