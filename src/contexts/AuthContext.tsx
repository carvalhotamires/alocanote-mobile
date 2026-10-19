import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../services/api';
import { authService, GoogleSignInParams } from '../services/authService';
import { userService } from '../services/userService';
import { LoginRequestDTO, LoginResponseDTO } from '../types';

export interface AuthUser {
  id?: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  customRole?: string | null;
  profilePictureUrl?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  signed: boolean;
  isLoadingAuth: boolean;
  loading: boolean;
  signIn: (credentials: LoginRequestDTO) => Promise<LoginResponseDTO>;
  signInWithGoogle: (params?: GoogleSignInParams) => Promise<LoginResponseDTO>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const refreshUserProfile = async (): Promise<AuthUser | null> => {
    try {
      const profile = await userService.getMyProfile();
      const updated: AuthUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        phone: profile.phone,
        customRole: profile.customRole,
        profilePictureUrl: profile.profilePictureUrl,
        street: profile.street,
        number: profile.number,
        neighborhood: profile.neighborhood,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
      };
      setUser(updated);
      await Promise.all([
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated)),
        AsyncStorage.setItem('@AlocaNote:user', JSON.stringify(updated)),
      ]);
      return updated;
    } catch {
      return null;
    }
  };

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
          refreshUserProfile();
        } else {
          const fallbackToken = await AsyncStorage.getItem('@AlocaNote:token');
          const fallbackUser = await AsyncStorage.getItem('@AlocaNote:user');
          if (fallbackToken && fallbackUser) {
            setAuthToken(fallbackToken);
            api.defaults.headers.Authorization = `Bearer ${fallbackToken}`;
            setToken(fallbackToken);
            setUser(JSON.parse(fallbackUser));
            refreshUserProfile();
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

  const persistAuthSession = async (data: LoginResponseDTO): Promise<LoginResponseDTO> => {
    setAuthToken(data.token);
    api.defaults.headers.Authorization = `Bearer ${data.token}`;

    await Promise.all([
      AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token),
      AsyncStorage.setItem('@AlocaNote:token', data.token),
    ]);

    let authUser: AuthUser = {
      email: data.email,
      name: data.name,
      role: data.role,
    };

    try {
      const profile = await userService.getMyProfile();
      authUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role || data.role,
        phone: profile.phone,
        customRole: profile.customRole,
        profilePictureUrl: profile.profilePictureUrl,
        street: profile.street,
        number: profile.number,
        neighborhood: profile.neighborhood,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
      };
    } catch {
      // Caso a rota /users/me falhe, mantemos os dados retornados no login
    }

    await Promise.all([
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser)),
      AsyncStorage.setItem('@AlocaNote:user', JSON.stringify(authUser)),
    ]);

    setToken(data.token);
    setUser(authUser);
    return data;
  };

  const signIn = async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const data = await authService.login(credentials);
    return persistAuthSession(data);
  };

  const signInWithGoogle = async (params?: GoogleSignInParams): Promise<LoginResponseDTO> => {
    const data = await authService.authenticateWithGoogle(params);
    return persistAuthSession(data);
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
        signInWithGoogle,
        signOut,
        refreshUserProfile,
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
