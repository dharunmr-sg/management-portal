import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner />
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, preserving the original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes (e.g., Dashboard Layout)
  return <Outlet />;
}
