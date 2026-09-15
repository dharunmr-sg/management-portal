export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
}
