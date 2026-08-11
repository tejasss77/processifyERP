import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
  isAdmin: boolean;
  isSales: boolean;
  isWarehouse: boolean;
  isAccounts: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.data);
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isSales = user?.role === 'SALES';
  const isWarehouse = user?.role === 'WAREHOUSE';
  const isAccounts = user?.role === 'ACCOUNTS';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasRole,
        isAdmin,
        isSales,
        isWarehouse,
        isAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
