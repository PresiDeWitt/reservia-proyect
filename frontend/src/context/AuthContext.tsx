import React, { createContext, useContext, useState } from 'react';
import type { AuthUser } from '../api/auth';
import { STORAGE_KEYS, storage } from '../api/storage';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, refresh: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const getInitialAuthState = (): AuthState => {
  const storedToken = storage.get(STORAGE_KEYS.TOKEN);
  const storedUser = storage.get(STORAGE_KEYS.USER);

  if (storedToken && storedUser && storedUser !== 'undefined' && storedToken !== 'undefined') {
    try {
      return {
        token: storedToken,
        user: JSON.parse(storedUser) as AuthUser,
      };
    } catch {
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH);
      storage.remove(STORAGE_KEYS.USER);
      return { token: null, user: null };
    }
  }

  storage.remove(STORAGE_KEYS.TOKEN);
  storage.remove(STORAGE_KEYS.REFRESH);
  storage.remove(STORAGE_KEYS.USER);
  return { token: null, user: null };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => getInitialAuthState());

  const login = (newToken: string, newRefresh: string, newUser: AuthUser) => {
    storage.set(STORAGE_KEYS.TOKEN, newToken);
    storage.set(STORAGE_KEYS.REFRESH, newRefresh);
    storage.setJSON(STORAGE_KEYS.USER, newUser);
    setAuthState({ token: newToken, user: newUser });
  };

  const logout = () => {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH);
    storage.remove(STORAGE_KEYS.USER);
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
