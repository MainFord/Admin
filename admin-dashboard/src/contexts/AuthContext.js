// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state to handle async auth checks

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/check-auth');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        // If not authenticated and not on the login page, redirect to login
        if (window.location.pathname !== '/login') {
          document.location.href = '/login';
        }
      } finally {
        setLoading(false); // Authentication check completed
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
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
      setIsAuthenticated(false);
      document.location.href = '/login'; // Redirect to login after logout
    } catch (error) {
      console.error('Logout failed', error);
      setIsAuthenticated(false); // Even if logout fails, update auth state
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
