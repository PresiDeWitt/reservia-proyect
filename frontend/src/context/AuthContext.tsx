import React, { createContext, useContext, useState } from 'react';
import type { AuthUser } from '../api/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const getInitialAuthState = (): AuthState => {
  const storedToken = localStorage.getItem('reservia_token');
  const storedUser = localStorage.getItem('reservia_user');

  if (storedToken && storedUser && storedUser !== 'undefined' && storedToken !== 'undefined') {
    try {
      return {
        token: storedToken,
        user: JSON.parse(storedUser) as AuthUser,
      };
    } catch {
      localStorage.removeItem('reservia_token');
      localStorage.removeItem('reservia_user');
      return { token: null, user: null };
    }
  }

  localStorage.removeItem('reservia_token');
  localStorage.removeItem('reservia_user');
  return { token: null, user: null };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => getInitialAuthState());

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('reservia_token', newToken);
    localStorage.setItem('reservia_user', JSON.stringify(newUser));
    setAuthState({ token: newToken, user: newUser });
  };

  const logout = () => {
    localStorage.removeItem('reservia_token');
    localStorage.removeItem('reservia_user');
    setAuthState({ token: null, user: null });
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        login,
        logout,
        isAuthenticated: !!authState.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
