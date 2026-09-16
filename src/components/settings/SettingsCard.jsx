import React from 'react';

export default function SettingsCard({ title, action, children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200 ${className}`}>
      {title && (
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
        {children}
      </div>
    </div>
  );
}
