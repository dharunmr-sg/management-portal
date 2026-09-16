export default function Input({ type = "text", name, placeholder, value, onChange, onClear, error, className = "", ...props }) {
  // If there's an error, we swap out the gray/blue borders for red borders!
  // If onClear is provided, we add padding-right so the text doesn't overlap the clear button!
  const baseClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors duration-300 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${onClear ? 'pr-10' : ''} ${className}`;
  
  const stateClasses = error 
    ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="w-full relative">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${stateClasses}`}
        {...props}
      />
      
      {/* Optional Clear Button */}
      {onClear && value && value.toString().length > 0 && (
        <button 
          type="button" 
          onClick={onClear} 
          className="absolute right-3 top-[9px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 transition-colors duration-300 ease-in-out"
          aria-label="Clear input"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {/* 4. Display the error directly underneath the input field if it exists! */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
