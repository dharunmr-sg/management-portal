import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  // A ref to hold the actual DOM node of our modal box so we can search inside it
  const modalRef = useRef(null);
  
  // Handle Escape key, Body Scroll Lock, and Focus Trapping
  useEffect(() => {
    // If the modal isn't open, do nothing.
    if (!isOpen) return;

    // --- FOCUS TRAP SETUP ---
    // A CSS selector that finds every single element a keyboard user can focus on
    const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    
    // Find all those elements inside our specific modal box
    let focusableElements = modalRef.current?.querySelectorAll(focusableElementsString);
    focusableElements = Array.prototype.slice.call(focusableElements || []); // Convert NodeList to Array
    
    const firstTabStop = focusableElements[0];
    const lastTabStop = focusableElements[focusableElements.length - 1];

    // Automatically focus the first item (e.g., the first input field) when the modal opens!
    if (firstTabStop) {
      firstTabStop.focus();
    }

    // 1. Listen for the Escape key and Tab key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        // If there are no focusable elements, don't let them tab out at all
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        if (e.shiftKey) {
          // If they press Shift + Tab (going backwards) on the FIRST item, loop to the LAST item
          if (document.activeElement === firstTabStop) {
            e.preventDefault();
            lastTabStop.focus();
          }
        } else {
          // If they press Tab (going forwards) on the LAST item, loop to the FIRST item
          if (document.activeElement === lastTabStop) {
            e.preventDefault();
            firstTabStop.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 2. Lock the background scrolling so the user doesn't accidentally scroll the page behind the modal
    document.body.style.overflow = 'hidden';

    // 3. Cleanup! When the modal closes, remove the listener and restore scrolling.
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Conditional rendering: If the parent says it is not open, render nothing.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* Backdrop: The dark transparent overlay. Clicking this closes the modal! */}
      <div 
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Basic White/Dark Box */}
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 relative z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        {/* Title Area with Close Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-colors"
            aria-label="Close modal"
          >
            {/* SVG icon for the "X" */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area (where the form will go) */}
        <div>
          {children}
        </div>
      </div>
      
    </div>
  );
}
