import React from 'react';

export default function FilterBar({ children, onClear, showClear = false }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 flex-wrap">
      {/* Dynamic children (the search inputs and selects) */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 flex-wrap w-full">
        {children}
      </div>
      
      {/* Clear Filters Button (rendered dynamically if needed) */}
      {showClear && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-4 py-2 mt-4 md:mt-0 whitespace-nowrap focus:outline-none"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}