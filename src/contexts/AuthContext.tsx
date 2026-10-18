import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../services/api';
import { authService } from '../services/authService';
import { LoginRequestDTO, LoginResponseDTO } from '../types';

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  signed: boolean;
  isLoadingAuth: boolean;
  loading: boolean;
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
          api.defaults.headers.Authorization = `Bearer ${storedToken}`;
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Fallback para chave antiga caso já estivesse salvo
          const fallbackToken = await AsyncStorage.getItem('@AlocaNote:token');
          const fallbackUser = await AsyncStorage.getItem('@AlocaNote:user');
          if (fallbackToken && fallbackUser) {
            setAuthToken(fallbackToken);
            api.defaults.headers.Authorization = `Bearer ${fallbackToken}`;
            setToken(fallbackToken);
            setUser(JSON.parse(fallbackUser));
          }
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
    api.defaults.headers.Authorization = `Bearer ${data.token}`;
    await Promise.all([
      AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token),
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser)),
      AsyncStorage.setItem('@AlocaNote:token', data.token),
      AsyncStorage.setItem('@AlocaNote:user', JSON.stringify(authUser)),
    ]);

    setToken(data.token);
    setUser(authUser);
    return data;
  };

  const signOut = async () => {
    setAuthToken(null);
    delete api.defaults.headers.Authorization;
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
      AsyncStorage.removeItem(USER_STORAGE_KEY),
      AsyncStorage.removeItem('@AlocaNote:token'),
      AsyncStorage.removeItem('@AlocaNote:user'),
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
        signed: !!token,
        isLoadingAuth,
        loading: isLoadingAuth,
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
