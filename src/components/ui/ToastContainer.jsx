import { useToast } from '../../context/ToastContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/30',
          border: 'border-emerald-200 dark:border-emerald-800',
          icon: 'text-emerald-500 dark:text-emerald-400',
          iconSvg: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/30',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-500 dark:text-red-400',
          iconSvg: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/30',
          border: 'border-amber-200 dark:border-amber-800',
          icon: 'text-amber-500 dark:text-amber-400',
          iconSvg: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/30',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-500 dark:text-blue-400',
          iconSvg: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none md:w-auto">
      {toasts.map((toast) => {
        const style = getToastStyles(toast.type);
        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 ${style.bg} ${style.border}`}
          >
            <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
              {style.iconSvg}
            </div>
            <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 rounded"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
