export default function Button({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md transition-colors duration-300 ease-in-out ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 dark:hover:bg-blue-400"
      } ${className}`}
    >
      {children}
    </button>
  );
}
