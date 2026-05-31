import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('lms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.profile();
      setUser(res.data);
    } catch {
      localStorage.removeItem('lms_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('lms_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password, role) => {
    const res = await authAPI.register({ name, email, password, role });
    localStorage.setItem('lms_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    setUser(null);
  };

  const updateUserXP = (xpIncrement) => {
    setUser(prev => prev ? { ...prev, xpPoints: prev.xpPoints + xpIncrement } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserXP, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
