// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      try {
        await api.get('/check-auth');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      if (response.status === 200) {
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
