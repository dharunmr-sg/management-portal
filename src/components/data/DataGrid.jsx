import { Link } from 'react-router-dom';

export default function DataGrid({ items, onEdit, onDelete }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link 
          to={`/users/${item.id}`} 
          key={item.id} 
          className="block p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all relative group"
        >
          {/* Main Content */}
          <p className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.email}</p>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">View Profile &rarr;</p>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Stop Link navigation
                  onEdit(item);
                }}
                className="text-xs font-medium text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-100 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-1 rounded"
              >
                Edit
              </button>
              
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Stop Link navigation
                  onDelete(item);
                }}
                className="text-xs font-medium text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-gray-100 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
