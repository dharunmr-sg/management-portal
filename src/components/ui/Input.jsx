export default function Input({ type = "text", name, placeholder, value, onChange, error, className = "", ...props }) {
  // If there's an error, we swap out the gray/blue borders for red borders!
  const baseClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${className}`;
  
  const stateClasses = error 
    ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${stateClasses}`}
        {...props}
      />
      
      {/* 4. Display the error directly underneath the input field if it exists! */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
