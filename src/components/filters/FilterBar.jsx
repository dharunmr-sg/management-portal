import React from 'react';

export default function FilterBar({ children, onClear, showClear = false, className = "" }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end gap-3 p-3 sm:p-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg flex-wrap ${className}`}>
      {/* Dynamic children (the search inputs and selects) */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
        {children}
      </div>
      
      {/* Clear Filters Button (rendered dynamically if needed) */}
      {showClear && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 whitespace-nowrap focus:outline-none h-[38px] flex items-center"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}