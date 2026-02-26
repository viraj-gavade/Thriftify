import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/v1/user/check-auth', {
        withCredentials: true,
      });
      if (response.status === 200 && response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(
      '/api/v1/user/login',
      { email, password },
      { withCredentials: true }
    );
    if (response.data?.success) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    } else {
      throw new Error(response.data?.message || 'Login failed');
    }
    return response.data;
  };

  const signup = async (formData) => {
    const response = await axios.post('/api/v1/user/signup', formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Auto-login after successful signup (backend sets cookie)
    if (response.data?.success !== false) {
      await checkAuth();
    }
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.get('/api/v1/user/logout', { withCredentials: true });
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    checkAuth,
    setUser,
    setIsAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
