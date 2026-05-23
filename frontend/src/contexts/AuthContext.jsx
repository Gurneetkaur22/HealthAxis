import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    const savedUser = localStorage.getItem('hms_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        API.get('/auth/me')
          .then((res) => {
            setUser(res.data.user);
            localStorage.setItem('hms_user', JSON.stringify(res.data.user));
          })
          .catch(() => {
            logout();
          })
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('hms_token', token);
    localStorage.setItem('hms_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('hms_token', token);
    localStorage.setItem('hms_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setUser(null);
  };

  const value = { user, loading, login, register, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
