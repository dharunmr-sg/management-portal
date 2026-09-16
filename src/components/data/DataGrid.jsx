import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

export default function DataGrid({ items, onEdit, onDelete }) {
  if (!items || items.length === 0) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'danger';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase">
                      {item.name ? item.name.charAt(0) : (item.firstName ? item.firstName.charAt(0) : '?')}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="primary">{item.role || 'Viewer'}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusColor(item.status)}>{item.status || 'Active'}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    <Link 
                      to={`/users/${item.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      aria-label="View user details"
                    >
                      View
                    </Link>
                    <button 
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      aria-label="Edit user"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(item)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      aria-label="Delete user"
                    >
                      Delete
                    </button>
                  </div>
                  {/* Fallback for mobile/touch where hover doesn't exist */}
                  <div className="flex items-center justify-end gap-3 md:hidden">
                    <Link to={`/users/${item.id}`} className="text-blue-600 dark:text-blue-400">View</Link>
                    <button onClick={() => onEdit(item)} className="text-indigo-600 dark:text-indigo-400">Edit</button>
                    <button onClick={() => onDelete(item)} className="text-red-600 dark:text-red-400">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
