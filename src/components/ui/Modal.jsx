import { useEffect, useRef } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'xl',
  maxWidth
}) {
  const modalRef = useRef(null);

  // Responsive modal width mappings:
  // xl uses a wide desktop dimension (~1100px) so rich multi-column forms fit on screen without vertical scrollbars
  const sizeClasses = {
    sm: "w-[calc(100vw-24px)] max-w-md", // ~448px for small confirmations
    md: "w-[calc(100vw-24px)] md:w-[85vw] md:max-w-xl", // ~576px
    lg: "w-[calc(100vw-24px)] md:w-[90vw] lg:max-w-4xl", // ~896px
    xl: "w-[calc(100vw-24px)] md:w-[92vw] lg:max-w-5xl xl:max-w-[1140px]", // ~1100px - 1140px on desktop
  };

  // Advanced features: Escape key, Scroll Lock, Focus Trapping
  useEffect(() => {
    if (!isOpen) return;

    // 1. Lock body scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 2. Setup Focus Trapping
    const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    let focusableElements = modalRef.current?.querySelectorAll(focusableElementsString);
    focusableElements = Array.prototype.slice.call(focusableElements || []);
    
    const firstTabStop = focusableElements[0];
    const lastTabStop = focusableElements[focusableElements.length - 1];

    if (firstTabStop) {
      firstTabStop.focus();
    }

    // 3. Handle Keyboard Events
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === firstTabStop) {
            e.preventDefault();
            lastTabStop.focus();
          }
        } else {
          if (document.activeElement === lastTabStop) {
            e.preventDefault();
            firstTabStop.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function when modal closes
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
      role="presentation"
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full ${
          maxWidth || sizeClasses[size] || sizeClasses.xl
        } max-h-[92vh] flex flex-col relative transition-all duration-300 ease-in-out my-auto`}
        onClick={(e) => e.stopPropagation()} 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        {/* Modal Header: Stays visible at top */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 id="modal-title" className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto px-5 sm:px-6 py-4 flex-1 overscroll-contain">
          {children}
        </div>

      </div>
    </div>
  );
}
