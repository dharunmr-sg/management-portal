import React, { createContext, useContext, useState, useEffect } from 'react';

const DataSourceContext = createContext();

export function DataSourceProvider({ children }) {
  const [dataSource, setDataSource] = useState(() => {
    return localStorage.getItem('app_data_source') || 'api'; // 'api' | 'local' | 'browser'
  });

  useEffect(() => {
    localStorage.setItem('app_data_source', dataSource);
  }, [dataSource]);

  const toggleDataSource = () => {
    setDataSource((prev) => {
      if (prev === 'api') return 'local';
      return 'api';
    });
  };

  return (
    <DataSourceContext.Provider value={{ dataSource, setDataSource, toggleDataSource }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}
