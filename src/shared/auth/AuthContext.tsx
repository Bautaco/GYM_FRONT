import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole } from '../../types/index.js';
import { authService } from './auth.service.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Provee la sesión actual a cualquier pantalla o componente de la aplicación. */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('gym_auth_token');
    const savedUser = localStorage.getItem('gym_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('gym_auth_token');
        localStorage.removeItem('gym_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const response = await authService.login(email, pass);
    setToken(response.accessToken);
    setUser(response.user);
    localStorage.setItem('gym_auth_token', response.accessToken);
    localStorage.setItem('gym_auth_user', JSON.stringify(response.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gym_auth_token');
    localStorage.removeItem('gym_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/** Obtiene la sesión. Requiere estar dentro de AuthProvider. */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
