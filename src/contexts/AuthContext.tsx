import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../services/api';
import { authService } from '../services/authService';
import { LoginRequestDTO, LoginResponseDTO } from '../types';

interface AuthUser {
  email: string;
  name: string;
  role: string;
}

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  signIn: (credentials: LoginRequestDTO) => Promise<LoginResponseDTO>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(USER_STORAGE_KEY),
        ]);

        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Falha ao restaurar autenticação:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const data = await authService.login(credentials);
    const authUser: AuthUser = {
      email: data.email,
      name: data.name,
      role: data.role,
    };

    setAuthToken(data.token);
    await Promise.all([
      AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token),
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser)),
    ]);

    setToken(data.token);
    setUser(authUser);
    return data;
  };

  const signOut = async () => {
    setAuthToken(null);
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
      AsyncStorage.removeItem(USER_STORAGE_KEY),
    ]);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoadingAuth,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
