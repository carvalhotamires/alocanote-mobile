import { Platform } from 'react-native';
import { api } from './api';
import { firebaseAuthClient } from './firebase';
import {
  FirebaseAuthRequestDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  RegisterUserRequestDTO,
  Role,
  UserResponseDTO,
} from '../types';

export interface GoogleSignInParams {
  googleIdToken?: string | null;
  googleAccessToken?: string | null;
  phone?: string;
  role?: Role;
  customRole?: string | null;
}

export const authService = {
  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    if (firebaseAuthClient.isConfigured()) {
      try {
        const fbResult = await firebaseAuthClient.signInWithEmailAndPassword(
          credentials.email,
          credentials.password
        );
        if (fbResult?.idToken) {
          const response = await api.post<LoginResponseDTO>('/auth/firebase', {
            idToken: fbResult.idToken,
            email: fbResult.email,
            name: fbResult.name,
            profilePictureUrl: fbResult.photoUrl,
          });
          return response.data;
        }
      } catch {
        // Fallback para login direto no backend (ex: usuários seed locais como admin@alocanote.com)
      }
    }

    const response = await api.post<LoginResponseDTO>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterUserRequestDTO): Promise<UserResponseDTO> {
    if (firebaseAuthClient.isConfigured()) {
      try {
        await firebaseAuthClient.registerWithEmailAndPassword(
          data.email,
          data.password,
          data.name
        );
      } catch {
        // Continua o registro no backend caso o usuário já exista ou o Firebase não esteja configurado
      }
    }

    const response = await api.post<UserResponseDTO>('/auth/register', data);
    return response.data;
  },

  async authenticateWithFirebase(data: FirebaseAuthRequestDTO): Promise<LoginResponseDTO> {
    const response = await api.post<LoginResponseDTO>('/auth/firebase', data);
    return response.data;
  },

  async authenticateWithGoogle(params?: GoogleSignInParams): Promise<LoginResponseDTO> {
    const fbResult =
      Platform.OS === 'web' && !params?.googleIdToken && !params?.googleAccessToken
        ? await firebaseAuthClient.signInWithGoogleWebPopup()
        : await firebaseAuthClient.signInWithGoogleCredential(
            params?.googleIdToken,
            params?.googleAccessToken
          );

    const response = await api.post<LoginResponseDTO>('/auth/google', {
      idToken: fbResult.idToken,
      email: fbResult.email || undefined,
      name: fbResult.name || undefined,
      profilePictureUrl: fbResult.photoUrl || undefined,
      phone: params?.phone,
      role: params?.role,
      customRole: params?.customRole,
    });

    return response.data;
  },
};
