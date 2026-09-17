import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

export default function DataGrid({ items, onEdit, onDelete, footer }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-fixed w-full min-w-[850px] divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th scope="col" className="w-[20%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="w-[22%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="w-[20%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="w-[12%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="w-[12%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="w-[14%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out group">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.image ? (
                      <img src={item.image} alt={item.firstName} className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 object-cover" />
                    ) : (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase text-xs">
                        {item.firstName ? item.firstName.charAt(0) : '?'}
                      </div>
                    )}
                    <div className="ml-3 text-sm font-medium text-gray-900 dark:text-white truncate">
                      {`${item.firstName || ''} ${item.lastName || ''}`.trim()}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 truncate">
                  {item.email || '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                  {item.company?.name || 'Unassigned'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant="primary">{item.role || 'user'}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {item.phone || '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <Link 
                      to={`/users/${item.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                      aria-label="View user details"
                    >
                      View Details
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
