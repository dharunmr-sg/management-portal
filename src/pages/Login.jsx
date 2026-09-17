import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, loading, error: authError, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!username.trim() || !password.trim()) {
      setLocalError('Both username and password are required.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await login({ username, password });
      showToast(`Welcome back, ${username}!`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
      // The error is also caught and set by AuthContext (authError).
    } finally {
      setIsSubmitting(false);
    }
  };

  // If AuthContext is checking for a saved session, we can show a full-screen loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 w-full">
        <Spinner />
      </div>
    );
  }

  // Redirect to dashboard if the user is already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Determine which error to show. Prioritize local validation errors, then auth errors.
  const displayError = localError || authError;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md mb-4">
            G
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access your GuideXR dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {displayError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {displayError}
                  </h3>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="Enter your username (e.g. emilys)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex justify-center py-2.5 px-4 text-sm font-medium"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
          
          <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-md p-4 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Demo Credentials:</p>
            <p>Username: <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded border border-gray-200 dark:border-gray-600">emilys</span></p>
            <p className="mt-1">Password: <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded border border-gray-200 dark:border-gray-600">emilyspass</span></p>
          </div>
        </form>
      </div>
    </div>
  );
}
