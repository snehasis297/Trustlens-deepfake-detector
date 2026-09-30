import React, { createContext, useContext, useState } from 'react';
import api, { setAuthToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setAuth = (newToken, newUser) => {
    setTokenState(newToken);
    setUser(newUser);
    setAuthToken(newToken);
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    // Direct Instant Demo Credentials Check
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'analyst@trustlens.ai' && (password === 'password123' || password === 'admin' || password === 'password')) {
      const demoToken = 'trustlens-demo-jwt-qualcomm-snapdragon-npu-token';
      setAuth(demoToken, { id: 1, name: 'Qualcomm AI Analyst', email: 'analyst@trustlens.ai' });
      setLoading(false);
      return { success: true };
    }

    try {
      const response = await api.post('/api/auth/login', { email: cleanEmail, password });
      const { token: receivedToken, userId, name, email: userEmail } = response.data;
      setAuth(receivedToken, { id: userId, name, email: userEmail });
      return { success: true };
    } catch (err) {
      // Seamless Dev Fallback: If backend port 8080 is offline, permit demo login
      if (!err.response || err.code === 'ERR_NETWORK') {
        const demoToken = 'trustlens-demo-jwt-qualcomm-snapdragon-npu-token';
        setAuth(demoToken, { id: 1, name: 'Qualcomm AI Analyst', email: cleanEmail || 'analyst@trustlens.ai' });
        return { success: true };
      }

      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    const cleanEmail = (email || '').trim().toLowerCase();

    try {
      const response = await api.post('/api/auth/register', { name, email: cleanEmail, password });
      const { token: receivedToken, userId, name: userName, email: userEmail } = response.data;
      setAuth(receivedToken, { id: userId, name: userName, email: userEmail });
      return { success: true };
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const demoToken = 'trustlens-demo-jwt-qualcomm-snapdragon-npu-token';
        setAuth(demoToken, { id: Date.now(), name: name || 'Qualcomm AI Analyst', email: cleanEmail });
        return { success: true };
      }

      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuth(null, null);
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
