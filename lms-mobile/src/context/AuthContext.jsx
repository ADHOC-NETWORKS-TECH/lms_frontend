import React, { createContext, useState, useContext, useEffect } from 'react';
import { getStorage, setStorage, removeStorage } from '../services/storage';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStorage('user');
    if (storedUser) setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.success) {
      setStorage('token', data.token);
      setStorage('user', data.user);
      setUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message };
  };

  const register = async (name, email, password, role = 'student') => {
    const data = await api.post('/auth/register', { name, email, password, role });
    if (data.success) {
      setStorage('token', data.token);
      setStorage('user', data.user);
      setUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    removeStorage('token');
    removeStorage('user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated: !!user, isAdmin,
      login, register, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};