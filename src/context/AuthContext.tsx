import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

// 1. Define the Context
export const AuthContext = createContext<any>(null);

// 2. Create the Provider Implementation
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Define API URL from environment
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('temp_access_token');
  }, []);

  const login = useCallback((data: any) => {
    // Backend returns userId and username in the JWT response
    setUser({ id: data.userId, username: data.username });
    setAccessToken(data.accessToken);
    
    // Store access token for the Axios interceptor and refresh token for persistence
    localStorage.setItem('temp_access_token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (!storedRefreshToken) {
      setLoading(false);
      return null;
    }

    try {
      console.log("Attempting to reconnect session...");
      const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
        refreshToken: storedRefreshToken
      });

      if (res.data.type === 'JWT') {
        login(res.data); // Update state and storage with fresh tokens
        return res.data.accessToken;
      }
    } catch (err) {
      console.error("Refresh failed or expired. Please login again.");
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL, login, logout]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value = {
    user,
    accessToken,
    loading,
    setLoading,
    login,
    logout,
    refreshSession 
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