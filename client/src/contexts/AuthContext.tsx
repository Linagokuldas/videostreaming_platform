import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Subscription } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  activeSubscription: Subscription | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('reelflix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('reelflix_token');
    if (!token) {
      setUser(null);
      setActiveSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setActiveSubscription(data.activeSubscription || null);
      localStorage.setItem('reelflix_user', JSON.stringify(data.user));
    } catch {
      localStorage.removeItem('reelflix_token');
      localStorage.removeItem('reelflix_user');
      setUser(null);
      setActiveSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      localStorage.setItem('reelflix_token', res.token);
      localStorage.setItem('reelflix_user', JSON.stringify(res.user));
      setUser(res.user);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, password);
      localStorage.setItem('reelflix_token', res.token);
      localStorage.setItem('reelflix_user', JSON.stringify(res.user));
      setUser(res.user);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('reelflix_token');
      localStorage.removeItem('reelflix_user');
      setUser(null);
      setActiveSubscription(null);
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        activeSubscription,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
