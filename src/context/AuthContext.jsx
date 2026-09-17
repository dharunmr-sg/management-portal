import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('authUser');
      const storedToken = localStorage.getItem('authToken');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      // Safely ignore invalid JSON from localStorage to prevent crashing
      console.error('Failed to parse user session from local storage', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await loginUser(credentials);
      
      // DummyJSON login typically returns an object with user details and a token (e.g. accessToken)
      const apiToken = response.accessToken || response.token;
      const { accessToken, token: _, ...userData } = response;
      
      const userObj = Object.keys(userData).length > 0 ? userData : response;

      setUser(userObj);
      setToken(apiToken);

      localStorage.setItem('authUser', JSON.stringify(userObj));
      if (apiToken) {
        localStorage.setItem('authToken', apiToken);
      }

      return response;
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
