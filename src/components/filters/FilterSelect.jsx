import React from 'react';

export default function FilterSelect({ label, value, onChange, options, defaultLabel = "All" }) {
  return (
    <div className="flex flex-col min-w-[150px] flex-1">
      {label && (
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <option value="">{defaultLabel}</option>
        {options.map((option, index) => {
          const val = typeof option === 'string' ? option : option.value;
          const display = typeof option === 'string' ? option : option.label;
          return (
            <option key={index} value={val}>
              {display}
            </option>
          );
        })}
      </select>
    </div>
  );
}