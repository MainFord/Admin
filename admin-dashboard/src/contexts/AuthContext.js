// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      try {
        await api.get('/check-auth');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/login'); // Redirect to login if not authenticated
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      if (response.status === 200) {
        setIsAuthenticated(true);
        navigate('/dashboard'); // Redirect to dashboard upon successful login
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
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout failed', error);
      // Optionally, you can still redirect to login even if logout fails
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
