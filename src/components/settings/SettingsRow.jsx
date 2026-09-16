import React from 'react';

export default function SettingsRow({ 
  icon, 
  label, 
  description, 
  children, 
  className = "",
  align = "center" // 'center' or 'top'
}) {
  return (
    <div className={`p-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-${align} justify-between gap-3 sm:gap-6 ${className}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 mt-0.5 text-gray-500 dark:text-gray-400">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <label className="text-sm font-medium text-gray-900 dark:text-white block">
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 sm:max-w-xs w-full sm:w-auto flex items-center justify-start sm:justify-end">
        {children}
      </div>
    </div>
  );
}
