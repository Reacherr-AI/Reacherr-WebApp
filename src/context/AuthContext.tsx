import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

interface BusinessInfo {
  bId: number;
  email: string;
  businessName?: string;
  phone?: string;
  profileComplete: boolean;
}

interface AuthContextType {
  token: string | null;
  user: BusinessInfo | null;
  loading: boolean;
  login: (newToken: string, userInfo: BusinessInfo) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export let globalLogout: () => void = () => {};


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, userInfo: BusinessInfo) => {
    setToken(newToken);
    setUser(userInfo);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userInfo));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }, []);

    globalLogout = logout;

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
