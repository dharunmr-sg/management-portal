import { useParams, Link } from 'react-router-dom';

export default function UserDetail() {
  // 1. We ask React Router for the parameters in the URL
  const { id } = useParams();

  return (
    <div>
      <div className="mb-6">
        {/* A simple link to go back to the list */}
        <Link to="/users" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
          &larr; Back to Users
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Profile</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <p className="text-gray-600 dark:text-gray-400">
          You are currently viewing the profile for User ID: <strong className="text-blue-600 dark:text-blue-400">{id}</strong>
        </p>
      </div>
    </div>
  );
}
