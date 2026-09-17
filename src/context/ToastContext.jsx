import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Auto-incrementing ID for toasts
  const [toastIdCounter, setToastIdCounter] = useState(0);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    setToastIdCounter((prevId) => {
      const id = prevId + 1;
      
      // Prevent exact duplicate active toasts
      setToasts((prev) => {
        if (prev.some(t => t.message === message && t.type === type)) {
          return prev;
        }
        
        const newToast = { id, message, type, duration };
        
        // Auto-remove after duration (if not 0/infinite)
        if (duration > 0) {
          setTimeout(() => {
            removeToast(id);
          }, duration);
        }

        return [...prev, newToast];
      });

      return id;
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
